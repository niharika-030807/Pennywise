import calendar
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Transaction
from app.auth import get_current_user

router = APIRouter(prefix="/api/wrap", tags=["wrap"])

@router.get("/summary")
def get_monthly_wrap(
    month: Optional[int] = None,
    year: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    now = datetime.now()
    target_year = year or now.year
    target_month = month or now.month

    month_str = f"{target_year}-{target_month:02d}"
    month_name = calendar.month_name[target_month]

    # Calculate previous month for comparison
    if target_month == 1:
        prev_month = 12
        prev_year = target_year - 1
    else:
        prev_month = target_month - 1
        prev_year = target_year
    prev_month_str = f"{prev_year}-{prev_month:02d}"
    prev_month_name = calendar.month_name[prev_month]

    # Get target month transactions
    current_txs = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.date.startswith(month_str)
    ).all()

    # Get previous month transactions
    prev_txs = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.date.startswith(prev_month_str)
    ).all()

    # Calculate metrics
    income = sum(t.amount for t in current_txs if t.type == "income")
    expenses = sum(t.amount for t in current_txs if t.type == "expense")
    savings = income - expenses
    savings_rate = round((savings / income * 100), 1) if income > 0 else 0.0

    prev_income = sum(t.amount for t in prev_txs if t.type == "income")
    prev_expenses = sum(t.amount for t in prev_txs if t.type == "expense")
    prev_savings = prev_income - prev_expenses

    # Days in target month
    num_days = calendar.monthrange(target_year, target_month)[1]
    # If current month, use days elapsed so far
    if target_year == now.year and target_month == now.month:
        effective_days = max(1, now.day)
    else:
        effective_days = num_days

    avg_daily_spend = round(expenses / effective_days, 2) if effective_days > 0 else 0.0
    num_transactions = len(current_txs)

    # Category breakdown
    cat_expenses: Dict[str, float] = {}
    prev_cat_expenses: Dict[str, float] = {}

    for t in current_txs:
        if t.type == "expense":
            cat_expenses[t.category] = cat_expenses.get(t.category, 0.0) + t.amount

    for t in prev_txs:
        if t.type == "expense":
            prev_cat_expenses[t.category] = prev_cat_expenses.get(t.category, 0.0) + t.amount

    category_list = [
        {"name": k, "amount": round(v, 2), "percentage": round((v / expenses * 100), 1) if expenses > 0 else 0}
        for k, v in cat_expenses.items()
    ]
    category_list.sort(key=lambda x: x["amount"], reverse=True)

    highest_cat = category_list[0]["name"] if category_list else "None"
    highest_cat_amt = category_list[0]["amount"] if category_list else 0.0

    lowest_cat = category_list[-1]["name"] if category_list else "None"
    lowest_cat_amt = category_list[-1]["amount"] if category_list else 0.0

    # Top spending category comparison with previous month
    highest_prev_amt = prev_cat_expenses.get(highest_cat, 0.0)
    if highest_prev_amt > 0:
        cat_pct_change = round(((highest_cat_amt - highest_prev_amt) / highest_prev_amt * 100), 1)
        if cat_pct_change > 0:
            top_cat_insight = f"You spent {cat_pct_change}% more on {highest_cat} compared to {prev_month_name}."
        else:
            top_cat_insight = f"Great work! You reduced {highest_cat} expenses by {abs(cat_pct_change)}% compared to {prev_month_name}."
    else:
        top_cat_insight = f"{highest_cat} was your largest expenditure category this month at ₹{highest_cat_amt:,.0f}."

    # Personalized Insights
    insights = []
    insights.append(top_cat_insight)

    if savings_rate >= 30:
        insights.append(f"Outstanding financial discipline! You saved {savings_rate}% of your monthly income (₹{savings:,.0f}).")
    elif savings_rate > 0:
        insights.append(f"You maintained a positive savings rate of {savings_rate}%, retaining ₹{savings:,.0f} in savings.")
    else:
        insights.append("Your expenses exceeded income this month. Prioritize curbing discretionary shopping and leisure.")

    if highest_cat == "Shopping" and highest_cat_amt > 5000:
        insights.append("Reducing unnecessary shopping expenses could improve your savings next month by up to ₹3,000.")
    elif highest_cat == "Food and Dining":
        insights.append("Food deliveries accounted for a large portion. Cooking at home 2 extra days a week can save ₹2,500/month.")
    else:
        insights.append(f"Staying on top of your {highest_cat} expenses will unlock higher compounding in your savings goals.")

    # Financial Personality badge
    if savings_rate >= 40:
        personality = "The Master Accumulator 🏆"
        badge_desc = "High savings rate, disciplined capital allocation."
    elif savings_rate >= 20:
        personality = "The Balanced Strategist ⚖️"
        badge_desc = "Solid equilibrium between lifestyle and future security."
    elif savings_rate > 0:
        personality = "The Adaptive Builder 🛠️"
        badge_desc = "Consistently net-positive with immense room for optimization."
    else:
        personality = "The Dynamic Spender ⚡"
        badge_desc = "High capital velocity; recommended to enforce category limits."

    # Available months list for selector
    available_months = [
        {"month": 10, "year": 2024, "label": "October 2024"},
        {"month": 11, "year": 2024, "label": "November 2024"},
        {"month": 12, "year": 2024, "label": "December 2024"},
        {"month": now.month, "year": now.year, "label": f"{month_name} {target_year} (Current)"}
    ]
    # Remove duplicates
    unique_months = []
    seen = set()
    for m in available_months:
        key = (m["month"], m["year"])
        if key not in seen:
            seen.add(key)
            unique_months.append(m)

    return {
        "title": f"YOUR {month_name.upper()} MONEY WRAP",
        "month_name": month_name,
        "year": target_year,
        "total_income": round(income, 2),
        "total_expenses": round(expenses, 2),
        "total_savings": round(savings, 2),
        "savings_rate": savings_rate,
        "highest_category": highest_cat,
        "highest_category_amount": highest_cat_amt,
        "lowest_category": lowest_cat,
        "lowest_category_amount": lowest_cat_amt,
        "num_transactions": num_transactions,
        "average_daily_spend": avg_daily_spend,
        "comparison_with_prev_month": {
            "prev_month_name": prev_month_name,
            "prev_income": round(prev_income, 2),
            "prev_expenses": round(prev_expenses, 2),
            "prev_savings": round(prev_savings, 2),
            "expense_diff": round(expenses - prev_expenses, 2),
            "savings_diff": round(savings - prev_savings, 2)
        },
        "category_breakdown": category_list,
        "insights": insights,
        "personality": personality,
        "badge_desc": badge_desc,
        "available_months": unique_months
    }

