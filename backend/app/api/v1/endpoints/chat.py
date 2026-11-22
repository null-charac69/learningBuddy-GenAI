from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.db.models import User
from app.schemas import ChatRequest, ChatResponse, Source
from app.services import llm_service, rag_service

router = APIRouter()

SYSTEM_PROMPT = """You are LearningBuddy, a patient study tutor.
- Answer using the student's study material in <context> when it is relevant, and cite it inline as [1], [2] matching the numbered excerpts.
- If the material does not cover the question, say so briefly, then answer from general knowledge.
- Explain step by step, use short paragraphs and Markdown lists where helpful, and end with one quick check-for-understanding question when the student is learning a concept.
- Never invent citations."""


def _snippet(text: str, n: int = 220) -> str:
    text = " ".join(text.split())
    return text if len(text) <= n else text[:n].rsplit(" ", 1)[0] + "…"


@router.post("", response_model=ChatResponse)
def chat(body: ChatRequest, current_user: User = Depends(get_current_user)):
    hits = rag_service.query(current_user.id, body.message, document_ids=body.document_ids)

    if hits:
        context = "\n\n".join(
            f"[{i}] (from {h['filename']})\n{h['text']}" for i, h in enumerate(hits, start=1)
        )
    else:
        context = "(no relevant study material found)"

    system = SYSTEM_PROMPT
    if current_user.learning_goals:
        system += f"\nThe student's learning goals: {current_user.learning_goals}"

    prompt = f"<context>\n{context}\n</context>\n\nStudent question: {body.message}"
    history = [(t.role, t.content) for t in body.history]
    answer = llm_service.generate_text(prompt, system=system, history=history)

    sources = [
        Source(document_id=h["document_id"], filename=h["filename"], snippet=_snippet(h["text"]))
        for h in hits
    ]
    return ChatResponse(answer=answer, sources=sources)
