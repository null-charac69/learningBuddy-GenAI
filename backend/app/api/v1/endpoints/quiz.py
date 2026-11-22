from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.db.models import User
from app.schemas import QuizQuestion, QuizRequest, QuizResponse, Source
from app.services import llm_service, rag_service
from app.services.llm_service import LLMError

router = APIRouter()


# Schema sent to Gemini: every field required, no defaults (Gemini's schema subset rejects them).
class _LLMQuestion(BaseModel):
    question: str
    options: list[str]
    answer: str
    explanation: str


class _QuizPayload(BaseModel):
    questions: list[_LLMQuestion]


SYSTEM_PROMPT = """You write multiple-choice quizzes that test understanding, not trivia.
Each question has exactly 4 distinct options, exactly one correct.
`answer` must be copied verbatim from `options`.
`explanation` is 1-2 sentences on why the answer is correct."""


def _clean(questions: list[_LLMQuestion]) -> list[QuizQuestion]:
    valid = []
    for q in questions:
        options = [o.strip() for o in q.options if o and o.strip()]
        answer = q.answer.strip()
        if len(options) < 2 or len(set(options)) != len(options):
            continue
        if answer not in options:
            # Tolerate answers given as a letter ("B") or with different casing.
            letters = {chr(65 + i): o for i, o in enumerate(options)}
            match = letters.get(answer.upper().rstrip(").")) or next(
                (o for o in options if o.lower() == answer.lower()), None
            )
            if not match:
                continue
            answer = match
        valid.append(QuizQuestion(question=q.question.strip(), options=options, answer=answer, explanation=q.explanation.strip()))
    return valid


@router.post("", response_model=QuizResponse)
def generate_quiz(body: QuizRequest, current_user: User = Depends(get_current_user)):
    hits = rag_service.query(current_user.id, body.topic, k=6) if body.use_documents else []

    prompt = (
        f"Write {body.num_questions} {body.difficulty} multiple-choice questions on: {body.topic}.\n"
    )
    if hits:
        material = "\n\n".join(f"[{i}] {h['text']}" for i, h in enumerate(hits, start=1))
        prompt += (
            "Base every question strictly on this study material from the student's notes:\n"
            f"<material>\n{material}\n</material>"
        )

    payload = llm_service.generate_structured(prompt, _QuizPayload, system=SYSTEM_PROMPT)
    questions = _clean(payload.questions)[: body.num_questions]
    if not questions:
        raise LLMError("The generated quiz was invalid. Please try again.")

    seen, sources = set(), []
    for h in hits:
        if h["document_id"] not in seen:
            seen.add(h["document_id"])
            sources.append(Source(document_id=h["document_id"], filename=h["filename"], snippet=""))

    return QuizResponse(topic=body.topic, questions=questions, grounded=bool(hits), sources=sources)
