from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BACKEND_DIR / "data"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", extra="ignore")

    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"

    DATABASE_URL: str = f"sqlite:///{DATA_DIR / 'learning_buddy.db'}"
    CHROMA_DIR: str = str(DATA_DIR / "vectorstore")
    CHROMA_COLLECTION: str = "learning_buddy"

    SECRET_KEY: str = "dev-only-insecure-secret-change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    MAX_UPLOAD_MB: int = 20
    CHUNK_SIZE: int = 1200
    CHUNK_OVERLAP: int = 200
    RAG_TOP_K: int = 4


settings = Settings()
