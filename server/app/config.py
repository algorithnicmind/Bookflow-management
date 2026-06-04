from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    ENVIRONMENT: str = "development"
    
    DATABASE_URL: str = "postgresql+asyncpg://localhost:5432/leave_management"
    
    JWT_SECRET: str = "your-super-cryptographically-secure-key-phrase-12345"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    ALLOWED_ORIGINS: list[str] = ["*"]  # In production, set this to actual domains (e.g. ["https://myfrontend.com"])
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
