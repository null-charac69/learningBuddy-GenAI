from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.api import api_router
from app.core.config import settings
from app.db import models  # noqa: F401  (registers tables on Base)
from app.db.database import Base, engine
from app.services.llm_service import LLMError

# No migrations yet: create any missing tables on startup.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="LearningBuddy API", version="0.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(LLMError)
async def llm_error_handler(_: Request, exc: LLMError):
    return JSONResponse(status_code=exc.status_code, content={"detail": str(exc)})


app.include_router(api_router, prefix="/api/v1")


@app.get("/api/v1/health", tags=["meta"])
def health():
    return {"status": "ok", "llm_configured": bool(settings.GEMINI_API_KEY), "model": settings.GEMINI_MODEL}


@app.get("/", include_in_schema=False)
def root():
    return {"message": "LearningBuddy API. See /docs"}
