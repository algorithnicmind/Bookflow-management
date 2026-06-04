from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base

from app.routes import auth, leaves, employees, dashboard

app = FastAPI(
    title="Leave Management System API",
    version="1.0",
    description="API for managing employee leaves, approvals, and balances."
)

# Configure CORS (from TRD)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to actual frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Initialize DB (Creates tables automatically if they don't exist)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(auth.router)
app.include_router(employees.router)
app.include_router(leaves.router)
app.include_router(dashboard.router)

@app.get("/")
def root():
    return {"message": "Leave Management API is running"}
