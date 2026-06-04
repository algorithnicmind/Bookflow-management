import uvicorn
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base

from app.routes import auth, leaves, employees, dashboard


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


app = FastAPI(
    title="Leave Management System API",
    version="1.0",
    description="API for managing employee leaves, approvals, and balances.",
    lifespan=lifespan
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

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)