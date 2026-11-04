from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routes import (
    auth,
    transactions,
    dashboard,
    budgets,
    goals,
    bank,
    wrap,
    assistant
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Pennywise: Make Every Rupee Count - Fintech API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(dashboard.router)
app.include_router(budgets.router)
app.include_router(goals.router)
app.include_router(bank.router)
app.include_router(wrap.router)
app.include_router(assistant.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "Pennywise Personal Finance Management",
        "tagline": "Make Every Rupee Count.",
        "version": "1.0.0",
        "currency": "INR (₹)"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

