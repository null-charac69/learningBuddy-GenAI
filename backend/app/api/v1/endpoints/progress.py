from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.db.database import get_db
from app.db.models import User, QuizResult
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()


class QuizResultRequest(BaseModel):
    topic: str
    score: int  # 0-100


@router.post("/quiz-result")
def save_quiz_result(
    request: QuizResultRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not (0 <= request.score <= 100):
        raise HTTPException(status_code=400, detail="Score must be between 0 and 100")
    result = QuizResult(user_id=current_user.id, topic=request.topic, score=request.score)
    db.add(result)
    db.commit()
    db.refresh(result)
    return {"message": "Quiz result saved", "id": result.id}


@router.get("/")
def get_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    results = db.query(QuizResult).filter(QuizResult.user_id == current_user.id).all()
    topics_covered = list({r.topic for r in results})
    quiz_scores = [{"topic": r.topic, "score": r.score, "taken_at": r.taken_at} for r in results]
    return {
        "topics_covered": topics_covered,
        "quiz_scores": quiz_scores,
        "session_count": len(results),
    }
