from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    DATABASE_URL: str = "sqlite:///./learning_buddy.db"
    SECRET_KEY: str = "learningbuddy-secret-key-change-in-production-2024"

    class Config:
        env_file = ".env"


settings = Settings()
