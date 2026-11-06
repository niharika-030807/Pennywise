from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.entities import User, Transaction
from app.services.analytics_service import AnalyticsService
from app.services.budget_service import BudgetService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/overview")
def get_dashboard_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Aggregates all key performance indicators and financial telemetry for the main dashboard."""
    metrics = AnalyticsService.compute_overview_metrics(db, current_user.id)
    all_txs = AnalyticsService.get_user_transactions(db, current_user.id)
    
    # Recent 6 transactions
    recent = all_txs[:6]

    # Category breakdown
    category_spending = AnalyticsService.compute_category_breakdown(all_txs)

    # Cashflow trends (last 14 days)
    cashflow_trend = AnalyticsService.compute_cashflow_trends(all_txs, days=14)

    # Budget overview
    budget_overview = BudgetService.get_current_budget_overview(db, current_user.id)

    return {
        "user_name": f"{current_user.first_name} {current_user.last_name}".strip(),
        "first_name": current_user.first_name,
        "total_balance": metrics["total_balance"],
        "monthly_income": metrics["monthly_income"],
        "monthly_expense": metrics["monthly_expense"],
        "total_savings": metrics["total_savings"],
        "prev_monthly_income": metrics["prev_monthly_income"],
        "prev_monthly_expense": metrics["prev_monthly_expense"],
        "transaction_count": metrics["transaction_count"],
        "recent_transactions": recent,
        "category_spending": category_spending,
        "cashflow_trend": cashflow_trend,
        "budget_progress": {
            "has_budget": budget_overview["has_budget"],
            "monthly_limit": budget_overview["monthly_limit"],
            "total_spent": budget_overview["total_spent"],
            "remaining": budget_overview["remaining"],
            "percentage": budget_overview["progress_percentage"],
            "category_progress": budget_overview["category_progress"],
            "alerts": budget_overview["alerts"]
        }
    }
