from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Personal Calorie Tracker"
    API_STR: str = "/api"
    SECRET_KEY: str = "Omkar_K@123"
    SQLALCHEMY_DATABASE_URL: str = "postgresql://omkarkhairnar:mh153599@localhost/calorie_tracker_db"
    GOOGLE_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
