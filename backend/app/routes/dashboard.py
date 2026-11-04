import json
from datetime import datetime, timedelta
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models import User, Transaction, Budget
from app.auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/overview")
def get_dashboard_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    now = datetime.now()
    current_month_str = now.strftime("%Y-%m")
    
    # Previous month string
    first_of_month = now.replace(day=1)
    prev_month_last_day = first_of_month - timedelta(days=1)
    prev_month_str = prev_month_last_day.strftime("%Y-%m")

    # Fetch all user transactions
    all_txs = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(desc(Transaction.date), desc(Transaction.id)).all()

    # Lifetime Totals
    total_income_all = sum(t.amount for t in all_txs if t.type == "income")
    total_expense_all = sum(t.amount for t in all_txs if t.type == "expense")
    total_balance = total_income_all - total_expense_all

    # Current Month
    current_txs = [t for t in all_txs if t.date.startswith(current_month_str)]
    monthly_income = sum(t.amount for t in current_txs if t.type == "income")
    monthly_expense = sum(t.amount for t in current_txs if t.type == "expense")
    monthly_savings = monthly_income - monthly_expense

    # Previous Month
    prev_txs = [t for t in all_txs if t.date.startswith(prev_month_str)]
    prev_income = sum(t.amount for t in prev_txs if t.type == "income")
    prev_expense = sum(t.amount for t in prev_txs if t.type == "expense")

    # Percentage changes
    income_change = round(((monthly_income - prev_income) / prev_income * 100), 1) if prev_income > 0 else 0.0
    expense_change = round(((monthly_expense - prev_expense) / prev_expense * 100), 1) if prev_expense > 0 else 0.0

    # Expense Category breakdown (Donut chart)
    category_totals: Dict[str, float] = {}
    standard_categories = [
        "Groceries", "Shopping", "Personal Expenses", "Food and Dining",
        "Transportation", "Entertainment", "Healthcare", "Education",
        "Rent and Bills", "Other Expenses"
    ]
    for cat in standard_categories:
        category_totals[cat] = 0.0

    for t in current_txs:
        if t.type == "expense":
            cat = t.category if t.category in category_totals else "Other Expenses"
            category_totals[cat] = category_totals.get(cat, 0.0) + t.amount

    category_data = [
        {"name": k, "value": round(v, 2)}
        for k, v in category_totals.items() if v > 0
    ]
    # Sort highest spending category first
    category_data.sort(key=lambda x: x["value"], reverse=True)

    # Income vs Expenses Trend (Last 6 months)
    monthly_trends = []
    for i in range(5, -1, -1):
        m_date = now - timedelta(days=i * 30)
        m_str = m_date.strftime("%Y-%m")
        m_label = m_date.strftime("%b")
        m_txs = [t for t in all_txs if t.date.startswith(m_str)]
        inc = sum(t.amount for t in m_txs if t.type == "income")
        exp = sum(t.amount for t in m_txs if t.type == "expense")
        monthly_trends.append({
            "month": m_label,
            "income": round(inc, 2),
            "expense": round(exp, 2),
            "savings": round(inc - exp, 2)
        })

    # Daily Expenses (Past 7 days)
    daily_expenses = []
    for i in range(6, -1, -1):
        d = now - timedelta(days=i)
        d_str = d.strftime("%Y-%m-%d")
        d_label = d.strftime("%a")
        day_spent = sum(t.amount for t in all_txs if t.date == d_str and t.type == "expense")
        daily_expenses.append({"day": d_label, "date": d_str, "amount": round(day_spent, 2)})

    # Weekly Expenses (Past 4 weeks)
    weekly_expenses = []
    for w in range(3, -1, -1):
        w_start = now - timedelta(days=(w + 1) * 7)
        w_end = now - timedelta(days=w * 7)
        w_start_str = w_start.strftime("%Y-%m-%d")
        w_end_str = w_end.strftime("%Y-%m-%d")
        w_spent = sum(
            t.amount for t in all_txs
            if t.type == "expense" and w_start_str <= t.date <= w_end_str
        )
        weekly_expenses.append({
            "week": f"Week {4 - w}",
            "amount": round(w_spent, 2)
        })

    # Budget Progress
    budget = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.month == now.month,
        Budget.year == now.year
    ).first()

    budget_limit = budget.monthly_limit if budget else 50000.0
    budget_spent = monthly_expense
    budget_remaining = max(0.0, budget_limit - budget_spent)
    budget_percentage = min(100.0, round((budget_spent / budget_limit * 100), 1)) if budget_limit > 0 else 0.0

    # Recent 5 transactions
    recent = [
        {
            "id": t.id,
            "title": t.title,
            "amount": t.amount,
            "type": t.type,
            "category": t.category,
            "date": t.date,
            "payment_method": t.payment_method
        }
        for t in all_txs[:6]
    ]

    return {
        "user_name": f"{current_user.first_name} {current_user.last_name}",
        "first_name": current_user.first_name,
        "total_balance": round(total_balance, 2),
        "monthly_income": round(monthly_income, 2),
        "monthly_expense": round(monthly_expense, 2),
        "monthly_savings": round(monthly_savings, 2),
        "income_change_pct": income_change,
        "expense_change_pct": expense_change,
        "category_breakdown": category_data,
        "trends": monthly_trends,
        "daily_expenses": daily_expenses,
        "weekly_expenses": weekly_expenses,
        "budget": {
            "limit": budget_limit,
            "spent": round(budget_spent, 2),
            "remaining": round(budget_remaining, 2),
            "percentage": budget_percentage
        },
        "recent_transactions": recent
    }

