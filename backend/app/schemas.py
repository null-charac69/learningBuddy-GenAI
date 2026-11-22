"""Pydantic request/response schemas for the API."""
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# --- Auth / users ---------------------------------------------------------
class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=40, pattern=r"^[A-Za-z0-9_.-]+$")
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    learning_goals: str
    created_at: datetime


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    learning_goals: Optional[str] = Field(default=None, max_length=2000)


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6, max_length=128)


# --- Documents ------------------------------------------------------------
class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    char_count: int
    chunk_count: int
    uploaded_at: datetime


# --- Chat -----------------------------------------------------------------
class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    history: list[ChatTurn] = Field(default_factory=list, max_length=20)
    document_ids: Optional[list[int]] = None


class Source(BaseModel):
    document_id: int
    filename: str
    snippet: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[Source]


# --- Quiz -----------------------------------------------------------------
class QuizRequest(BaseModel):
    topic: str = Field(min_length=1, max_length=200)
    num_questions: int = Field(default=5, ge=1, le=15)
    difficulty: Literal["easy", "medium", "hard"] = "medium"
    use_documents: bool = True


class QuizQuestion(BaseModel):
    question: str
    options: list[str]
    answer: str
    explanation: str = ""


class QuizResponse(BaseModel):
    topic: str
    questions: list[QuizQuestion]
    grounded: bool  # True when questions were generated from the user's documents
    sources: list[Source] = Field(default_factory=list)


# --- Progress -------------------------------------------------------------
class QuizResultCreate(BaseModel):
    topic: str = Field(min_length=1, max_length=200)
    score: int = Field(ge=0, le=100)
    correct: Optional[int] = Field(default=None, ge=0)
    total: Optional[int] = Field(default=None, ge=1)


class QuizResultOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    topic: str
    score: int
    correct: Optional[int]
    total: Optional[int]
    taken_at: datetime


class TopicStat(BaseModel):
    topic: str
    attempts: int
    average: float
    best: int
    last: int


class ProgressOut(BaseModel):
    quiz_scores: list[QuizResultOut]
    topics: list[TopicStat]
    topics_covered: list[str]
    session_count: int
    average_score: float
    document_count: int
