from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Project Information
    PROJECT_NAME: str = "Metacortex"
    VERSION: str = "0.1.0"
    DESCRIPTION: str = "A modular, extensible platform for personal life and work management"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/metacortex_dev"
    DATABASE_ECHO: bool = False
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Clerk Authentication
    CLERK_SECRET_KEY: str = ""
    CLERK_PUBLISHABLE_KEY: str = ""
    CLERK_WEBHOOK_SECRET: str = ""
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = []
    
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if not v:
                return []
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return []
    
    # OpenAI Configuration (for future AI features)
    OPENAI_API_KEY: str = ""
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # Email (for notifications)
    SMTP_TLS: bool = True
    SMTP_PORT: int = 587
    SMTP_HOST: str = ""
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM_EMAIL: str = "noreply@metacortex.app"
    EMAILS_FROM_NAME: str = "Metacortex"
    
    # First User (for initial setup)
    FIRST_USER_EMAIL: str = "admin@metacortex.app"
    FIRST_USER_PASSWORD: str = "changeme"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Set default CORS origins based on environment
        if not self.BACKEND_CORS_ORIGINS:
            if self.ENVIRONMENT == "development":
                self.BACKEND_CORS_ORIGINS = [
                    "http://localhost:3000",
                    "http://localhost:3001",
                    "http://127.0.0.1:3000",
                    "http://127.0.0.1:3001",
                ]
            else:
                # In production, set specific allowed origins
                self.BACKEND_CORS_ORIGINS = []


# Create settings instance
settings = Settings()