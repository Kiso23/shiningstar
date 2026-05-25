from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./dev.db"

    # Auth
    SECRET_KEY: str  # required, no default
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # File uploads
    UPLOAD_DIR: str = "./uploads"
    MAX_LOGO_SIZE_BYTES: int = 2 * 1024 * 1024        # 2 MB
    MAX_PAYMENT_PROOF_SIZE_BYTES: int = 5 * 1024 * 1024  # 5 MB
    MAX_PLAYER_PHOTO_SIZE_BYTES: int = 3 * 1024 * 1024  # 3 MB
    ALLOWED_IMAGE_MIME_TYPES: list[str] = ["image/jpeg", "image/png", "image/jpg", "image/webp"]

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "https://ssufc.netlify.app",
        "https://www.ssufc.netlify.app",
        "https://shiningstarunited.netlify.app",
        "https://www.shiningstarunited.netlify.app",
    ]
    
    # API Base URL for constructing full URLs
    API_BASE_URL: str = "https://shiningstar.onrender.com"

    # SMTP Email (all optional — emails are skipped if SMTP_HOST is not set)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_TLS: bool = True
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@shiningstarunited.com"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @field_validator('SECRET_KEY')
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        """Validate SECRET_KEY is set and has minimum length."""
        if not v or len(v) < 32:
            raise ValueError('SECRET_KEY must be set and at least 32 characters long')
        return v

    @field_validator('DATABASE_URL')
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        """Validate DATABASE_URL is set."""
        if not v:
            raise ValueError('DATABASE_URL must be set')
        return v

    @field_validator('SMTP_PORT')
    @classmethod
    def validate_smtp_port(cls, v: int) -> int:
        """Validate SMTP_PORT is in valid range."""
        if v < 1 or v > 65535:
            raise ValueError('SMTP_PORT must be between 1 and 65535')
        return v

    @field_validator('ACCESS_TOKEN_EXPIRE_MINUTES')
    @classmethod
    def validate_token_expiry(cls, v: int) -> int:
        """Validate ACCESS_TOKEN_EXPIRE_MINUTES is positive."""
        if v <= 0:
            raise ValueError('ACCESS_TOKEN_EXPIRE_MINUTES must be positive')
        return v


settings = Settings()
