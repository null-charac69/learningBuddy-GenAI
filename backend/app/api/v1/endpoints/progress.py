from collections import defaultdict

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.db.models import Document, QuizResult, User
from app.schemas import ProgressOut, QuizResultCreate, QuizResultOut, TopicStat

router = APIRouter()


@router.post("/quiz-result", response_model=QuizResultOut, status_code=status.HTTP_201_CREATED)
def save_quiz_result(
    body: QuizResultCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = QuizResult(
        user_id=current_user.id,
        topic=body.topic.strip(),
        score=body.score,
        correct=body.correct,
        total=body.total,
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result


@router.get("", response_model=ProgressOut)
def get_progress(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    results = (
        db.query(QuizResult)
        .filter(QuizResult.user_id == current_user.id)
        .order_by(QuizResult.taken_at.asc())
        .all()
    )
    doc_count = db.query(Document).filter(Document.user_id == current_user.id).count()

    by_topic: dict[str, list[int]] = defaultdict(list)
    display_name: dict[str, str] = {}
    for r in results:
        key = r.topic.lower()
        by_topic[key].append(r.score)
        display_name.setdefault(key, r.topic)

    topics = sorted(
        (
            TopicStat(
                topic=display_name[k],
                attempts=len(scores),
                average=round(sum(scores) / len(scores), 1),
                best=max(scores),
                last=scores[-1],
            )
            for k, scores in by_topic.items()
        ),
        key=lambda t: t.average,
    )

    return ProgressOut(
        quiz_scores=results,
        topics=topics,
        topics_covered=[t.topic for t in topics],
        session_count=len(results),
        average_score=round(sum(r.score for r in results) / len(results), 1) if results else 0.0,
        document_count=doc_count,
    )
