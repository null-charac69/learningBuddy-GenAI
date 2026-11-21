from fastapi import APIRouter
from backend.app.services.llm_service import get_llm_response

router = APIRouter()

@router.get("/quiz")
def get_quiz(topic: str):
    prompt = f"Generate a 3-question multiple choice quiz on the topic of {topic}. Provide the questions, options, and the correct answer."
    quiz_data = get_llm_response(prompt)
    return {"quiz": quiz_data}