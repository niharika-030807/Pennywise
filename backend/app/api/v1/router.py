from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    transactions,
    dashboard,
    budgets,
    goals,
    bank,
    wrap,
    assistant
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(transactions.router)
api_router.include_router(dashboard.router)
api_router.include_router(budgets.router)
api_router.include_router(goals.router)
api_router.include_router(bank.router)
api_router.include_router(wrap.router)
api_router.include_router(assistant.router)
