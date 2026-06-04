from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    ENVIRONMENT: str = "development"
    
    DATABASE_URL: str = "postgresql+asyncpg://localhost:5432/leave_management"
    
    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def format_database_url(cls, v: str | None) -> str | None:
        if isinstance(v, str):
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql+asyncpg://", 1)
            elif v.startswith("postgresql://"):
                return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v
    
    JWT_SECRET: str = "your-super-cryptographically-secure-key-phrase-12345"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    ALLOWED_ORIGINS: list[str] = ["*"]  # In production, set this to actual domains (e.g. ["https://myfrontend.com"])
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
