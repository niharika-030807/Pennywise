import json
from datetime import datetime
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Budget, Transaction
from app.schemas import BudgetCreate
from app.auth import get_current_user

router = APIRouter(prefix="/api/budgets", tags=["budgets"])

DEFAULT_CATEGORY_BUDGETS = {
    "Rent and Bills": 20000.0,
    "Groceries": 6000.0,
    "Shopping": 6000.0,
    "Food and Dining": 4000.0,
    "Transportation": 3000.0,
    "Entertainment": 2500.0,
    "Healthcare": 3000.0,
    "Personal Expenses": 2500.0,
    "Education": 3000.0,
    "Other Expenses": 2000.0
}

@router.get("/current")
def get_current_budget(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    now = datetime.now()
    month_str = now.strftime("%Y-%m")

    budget = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.month == now.month,
        Budget.year == now.year
    ).first()

    if not budget:
        # Create default budget for the user
        budget = Budget(
            user_id=current_user.id,
            month=now.month,
            year=now.year,
            monthly_limit=50000.0,
            category_budgets=json.dumps(DEFAULT_CATEGORY_BUDGETS)
        )
        db.add(budget)
        db.commit()
        db.refresh(budget)

    category_limits: Dict[str, float] = json.loads(budget.category_budgets or "{}")

    # Fetch current month expenses
    txs = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense",
        Transaction.date.startswith(month_str)
    ).all()

    total_spent = sum(t.amount for t in txs)
    remaining = max(0.0, budget.monthly_limit - total_spent)
    progress_percentage = min(100.0, round((total_spent / budget.monthly_limit * 100), 1)) if budget.monthly_limit > 0 else 0.0

    # Category-wise progress and alerts
    category_progress: List[Dict[str, Any]] = []
    alerts: List[str] = []

    cat_spent_map: Dict[str, float] = {}
    for t in txs:
        cat_spent_map[t.category] = cat_spent_map.get(t.category, 0.0) + t.amount

    for cat, limit in category_limits.items():
        spent = cat_spent_map.get(cat, 0.0)
        pct = min(100.0, round((spent / limit * 100), 1)) if limit > 0 else 0.0
        status = "normal"
        if pct >= 100:
            status = "exceeded"
            alerts.append(f"⚠️ Budget Exceeded: You have spent 100% of your {cat} budget (₹{spent:,.0f} / ₹{limit:,.0f}).")
        elif pct >= 80:
            status = "warning"
            alerts.append(f"⚡ High Spend: You have utilized {pct}% of your {cat} budget.")

        category_progress.append({
            "category": cat,
            "limit": limit,
            "spent": round(spent, 2),
            "remaining": max(0.0, round(limit - spent, 2)),
            "percentage": pct,
            "status": status
        })

    # Overall monthly limit alert
    if progress_percentage >= 100:
        alerts.insert(0, f"🚨 Critical: Overall monthly budget of ₹{budget.monthly_limit:,.0f} has been fully reached!")
    elif progress_percentage >= 85:
        alerts.insert(0, f"⚠️ Warning: Overall budget utilization is at {progress_percentage}%. Consider slowing discretionary expenses.")

    # Next month recommendation
    recommendations = [
        "Cap Shopping at 15% of your total budget to increase emergency savings.",
        "Maintain Dining & Entertainment below ₹6,000 combined to reach your savings goals faster.",
        f"Your current savings velocity will yield ₹{(budget.monthly_limit - total_spent) * 12:,.0f} annual surplus if spending remains on track."
    ]

    return {
        "id": budget.id,
        "month": budget.month,
        "year": budget.year,
        "monthly_limit": budget.monthly_limit,
        "total_spent": round(total_spent, 2),
        "remaining": round(remaining, 2),
        "progress_percentage": progress_percentage,
        "category_progress": category_progress,
        "alerts": alerts,
        "recommendations": recommendations
    }

@router.post("")
def update_or_create_budget(
    req: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    budget = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.month == req.month,
        Budget.year == req.year
    ).first()

    if budget:
        budget.monthly_limit = req.monthly_limit
        budget.category_budgets = json.dumps(req.category_budgets)
    else:
        budget = Budget(
            user_id=current_user.id,
            month=req.month,
            year=req.year,
            monthly_limit=req.monthly_limit,
            category_budgets=json.dumps(req.category_budgets)
        )
        db.add(budget)

    db.commit()
    db.refresh(budget)
    return {"success": True, "message": "Budget successfully saved!", "budget_id": budget.id}

