import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Core Configuration Settings
    ---------------------------
    Manages all environment variables and default settings for the application.
    Uses Pydantic BaseSettings to automatically read from environment variables or a .env file,
    providing type safety and validation.
    """
    
    # Server configuration
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    ENVIRONMENT: str = "development" # "development" | "production"
    
    # Database configuration
    # Default connection string to local PostgreSQL database
    DATABASE_URL: str = "postgresql+asyncpg://localhost:5432/leave_management"
    
    # External API Keys
    GEMINI_API_KEY: Optional[str] = None
    
    # Authentication & JWT configuration
    JWT_SECRET: Optional[str] = None
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # Token expires in 24 hours (1440 minutes)

    # OAuth configuration
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    @property
    def async_database_url(self) -> str:
        """
        Dynamically adjusts the DATABASE_URL to ensure it uses the asynchronous Postgres driver (asyncpg).
        Also adjusts SSL arguments for compatibility.
        """
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        
        # Standardize sslmode formatting for asyncpg compatibility
        if "?sslmode=" in url:
            url = url.replace("?sslmode=", "?ssl=")
        elif "&sslmode=" in url:
            url = url.replace("&sslmode=", "&ssl=")
            
        return url

    # Pydantic configuration to define how to load the .env file
    # Look for .env in the workspace root and the server/ folder
    model_config = SettingsConfigDict(
        env_file=(
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), ".env"),
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        ),
        extra="ignore" # Ignore extra environment variables not defined in this class
    )

# Instantiate the global settings object to be imported across the application
settings = Settings()

# Critical validation: Ensure the application doesn't start without a secret key
assert settings.JWT_SECRET is not None, "JWT_SECRET must be set in environment variables"
