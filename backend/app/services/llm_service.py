"""Thin wrapper around Google Gemini (google-genai SDK).

All Gemini failures are converted to `LLMError` so endpoints can return a clear
HTTP error instead of leaking stack traces or returning the error as an "answer".
"""
from functools import lru_cache
from typing import Optional, Type, TypeVar

from google import genai
from google.genai import errors as genai_errors
from google.genai import types
from pydantic import BaseModel

from app.core.config import settings

T = TypeVar("T", bound=BaseModel)


class LLMError(RuntimeError):
    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code


@lru_cache
def _client() -> genai.Client:
    if not settings.GEMINI_API_KEY:
        raise LLMError(
            "GEMINI_API_KEY is not set. Add it to backend/.env and restart the server.", 503
        )
    return genai.Client(api_key=settings.GEMINI_API_KEY)


def _call(contents, config: types.GenerateContentConfig):
    try:
        return _client().models.generate_content(
            model=settings.GEMINI_MODEL, contents=contents, config=config
        )
    except LLMError:
        raise
    except genai_errors.APIError as e:
        msg = str(getattr(e, "message", "") or e)
        if "API key not valid" in msg or "API_KEY_INVALID" in msg:
            raise LLMError("Gemini rejected the API key. Set a valid GEMINI_API_KEY in backend/.env.", 503)
        if getattr(e, "code", None) == 429:
            raise LLMError("Gemini rate limit reached. Wait a moment and try again.", 429)
        raise LLMError(f"Gemini request failed: {msg}")
    except Exception as e:  # network errors etc.
        raise LLMError(f"Could not reach Gemini: {e}")


def generate_text(
    prompt: str,
    system: Optional[str] = None,
    history: Optional[list[tuple[str, str]]] = None,
) -> str:
    """`history` is a list of (role, text) with role in {"user", "assistant"}."""
    contents = [
        types.Content(role="model" if role == "assistant" else "user", parts=[types.Part(text=text)])
        for role, text in (history or [])
    ]
    contents.append(types.Content(role="user", parts=[types.Part(text=prompt)]))
    resp = _call(contents, types.GenerateContentConfig(system_instruction=system, temperature=0.4))
    text = (resp.text or "").strip()
    if not text:
        raise LLMError("Gemini returned an empty response.")
    return text


def generate_structured(prompt: str, schema: Type[T], system: Optional[str] = None) -> T:
    resp = _call(
        prompt,
        types.GenerateContentConfig(
            system_instruction=system,
            temperature=0.7,
            response_mime_type="application/json",
            response_schema=schema,
        ),
    )
    if isinstance(resp.parsed, schema):
        return resp.parsed
    try:
        return schema.model_validate_json(resp.text or "")
    except Exception:
        raise LLMError("Gemini returned malformed structured output. Please try again.")
