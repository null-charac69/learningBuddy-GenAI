
from fastapi import APIRouter
from backend.app.api.v1.endpoints import chat, files, quiz, progress

api_router = APIRouter()
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(files.router, prefix="/files", tags=["files"])
api_router.include_router(quiz.router, prefix="/quiz", tags=["quiz"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
