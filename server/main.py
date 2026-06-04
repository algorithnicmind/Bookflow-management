from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database import engine, Base

from app.routes import auth, leaves, employees, dashboard
import uvicorn
import os

from app.config import settings
from app.middleware.handlers import RequestLoggingMiddleware, global_exception_handler
from app.logger import logger




@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB (Creates tables automatically if they don't exist)
    logger.info("Starting up — initializing database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database initialized successfully.")
    yield
    # Shutdown
    logger.info("Shutting down...")
    await engine.dispose()


# Disable Swagger/ReDoc in production to prevent API reconnaissance
docs_url = "/docs" if settings.ENVIRONMENT == "development" else None
redoc_url = "/redoc" if settings.ENVIRONMENT == "development" else None

app = FastAPI(
    title="Leave Management System API",
    version="1.0",
    description="API for managing employee leaves, approvals, and balances.",
    lifespan=lifespan,
    docs_url=docs_url,
    redoc_url=redoc_url
)



# Configure CORS dynamically for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Custom Middlewares
app.add_middleware(RequestLoggingMiddleware)

# Register Global Exception Handlers
app.add_exception_handler(Exception, global_exception_handler)

app.include_router(auth.router)
app.include_router(employees.router)
app.include_router(leaves.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"message": "Leave Management API is running"}


@app.get("/health")
async def health_check():
    """Production health check — verifies DB connectivity."""
    try:
        async with engine.connect() as conn:
            await conn.execute(__import__("sqlalchemy").text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "database": "disconnected"}
        )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)