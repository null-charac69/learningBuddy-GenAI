from fastapi import APIRouter

router = APIRouter()

@router.get("/progress")
def get_progress():
    """
    Fetch learning progress metrics.
    NOTE: Currently returns mock telemetry while PostgreSQL / SQLite persistence is in active development (WIP).
    """
    return {
        "topics_covered": ["Python", "FastAPI", "React"],
        "quiz_scores": [
            {"topic": "Python", "score": 85},
            {"topic": "FastAPI", "score": 92}
        ],
        "session_count": 12,
        "_status": "wip_mock_data"
    }
