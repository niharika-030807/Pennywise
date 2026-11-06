import calendar
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.models.entities import Transaction

class WrapService:
    @staticmethod
    def generate_monthly_wrap(db: Session, user_id: int, month: Optional[int] = None, year: Optional[int] = None) -> Dict[str, Any]:
        """Generates comprehensive Monthly Money Wrap with telemetry and insights."""
        now = datetime.utcnow()
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
            Transaction.user_id == user_id,
            Transaction.date.startswith(month_str)
        ).all()

        # Get previous month transactions
        prev_txs = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.date.startswith(prev_month_str)
        ).all()

        # Get all distinct months user has transactions for
        all_txs = db.query(Transaction).filter(Transaction.user_id == user_id).all()
        month_keys = sorted(list(set(t.date[:7] for t in all_txs if len(t.date) >= 7)), reverse=True)

        available_months = []
        for mk in month_keys:
            try:
                y, m = int(mk[:4]), int(mk[5:7])
                lbl = f"{calendar.month_name[m]} {y}"
                if y == now.year and m == now.month:
                    lbl += " (Current)"
                available_months.append({"month": m, "year": y, "label": lbl})
            except Exception:
                pass

        if not any(m["month"] == target_month and m["year"] == target_year for m in available_months):
            available_months.insert(0, {
                "month": target_month,
                "year": target_year,
                "label": f"{month_name} {target_year}" + (" (Current)" if target_year == now.year and target_month == now.month else "")
            })

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
        effective_days = max(1, now.day) if (target_year == now.year and target_month == now.month) else num_days
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

        if num_transactions == 0:
            return {
                "title": f"YOUR {month_name.upper()} MONEY WRAP",
                "month_name": month_name,
                "year": target_year,
                "total_income": 0.0,
                "total_expenses": 0.0,
                "total_savings": 0.0,
                "savings_rate": 0.0,
                "highest_category": "None",
                "highest_category_amount": 0.0,
                "lowest_category": "None",
                "lowest_category_amount": 0.0,
                "num_transactions": 0,
                "average_daily_spend": 0.0,
                "comparison_with_prev_month": None,
                "category_breakdown": [],
                "insights": [
                    "No transactions recorded for this month yet.",
                    "Record your daily expenses and income to unlock personalized insights and category breakdowns.",
                    "Your financial wrap will update automatically as soon as you record entries."
                ],
                "personality": "New Voyager 🌱",
                "badge_desc": "Your financial journey begins here. Add transactions to analyze your spending.",
                "available_months": available_months
            }

        category_list = [
            {"name": k, "amount": round(v, 2), "percentage": round((v / expenses * 100), 1) if expenses > 0 else 0}
            for k, v in cat_expenses.items()
        ]
        category_list.sort(key=lambda x: x["amount"], reverse=True)

        highest_cat = category_list[0]["name"] if category_list else "None"
        highest_cat_amt = category_list[0]["amount"] if category_list else 0.0

        lowest_cat = category_list[-1]["name"] if category_list else "None"
        lowest_cat_amt = category_list[-1]["amount"] if category_list else 0.0

        # Comparison with previous month
        highest_prev_amt = prev_cat_expenses.get(highest_cat, 0.0)
        if highest_prev_amt > 0:
            cat_pct_change = round(((highest_cat_amt - highest_prev_amt) / highest_prev_amt * 100), 1)
            if cat_pct_change > 0:
                top_cat_insight = f"You spent {cat_pct_change}% more on {highest_cat} compared to {prev_month_name}."
            else:
                top_cat_insight = f"Great work! You reduced {highest_cat} expenses by {abs(cat_pct_change)}% compared to {prev_month_name}."
        else:
            top_cat_insight = f"{highest_cat} was your largest expenditure category this month at ₹{highest_cat_amt:,.0f}."

        insights = [top_cat_insight]
        if savings_rate >= 30:
            insights.append(f"Outstanding financial discipline! You saved {savings_rate}% of your monthly income (₹{savings:,.0f}).")
        elif savings_rate > 0:
            insights.append(f"You maintained a positive savings rate of {savings_rate}%, retaining ₹{savings:,.0f} in savings.")
        else:
            insights.append("Your expenses exceeded income this month. Prioritize curbing discretionary shopping and dining.")

        if highest_cat == "Shopping" and highest_cat_amt > 5000:
            insights.append("Reducing unnecessary shopping expenses could improve your savings next month by up to ₹3,000.")
        elif highest_cat == "Food and Dining":
            insights.append("Food deliveries accounted for a large portion. Cooking at home 2 extra days a week can save ₹2,500/month.")
        else:
            insights.append(f"Staying on top of your {highest_cat} expenses will unlock higher compounding in your savings goals.")

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
            "available_months": available_months
        }
