from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.entities import Transaction, ConnectedBank

class AnalyticsService:
    """Unified financial analytics and telemetry computation engine."""

    @staticmethod
    def get_user_transactions(db: Session, user_id: int) -> List[Transaction]:
        """Fetch all user transactions ordered by date descending."""
        return db.query(Transaction).filter(Transaction.user_id == user_id).order_by(
            Transaction.date.desc(), Transaction.id.desc()
        ).all()

    @staticmethod
    def compute_overview_metrics(db: Session, user_id: int) -> Dict[str, Any]:
        """Compute balance, income, expense, and savings across all time and current month."""
        all_txs = db.query(Transaction).filter(Transaction.user_id == user_id).all()
        now = datetime.utcnow()
        current_month_prefix = now.strftime("%Y-%m")

        total_income_all = sum(t.amount for t in all_txs if t.type == "income")
        total_expense_all = sum(t.amount for t in all_txs if t.type == "expense")

        # Bank accounts balance
        banks = db.query(ConnectedBank).filter(ConnectedBank.user_id == user_id).all()
        bank_balance = sum(b.balance for b in banks)

        total_balance = (total_income_all - total_expense_all) + bank_balance

        # Current Month
        current_month_txs = [t for t in all_txs if t.date.startswith(current_month_prefix)]
        monthly_income = sum(t.amount for t in current_month_txs if t.type == "income")
        monthly_expense = sum(t.amount for t in current_month_txs if t.type == "expense")
        monthly_savings = monthly_income - monthly_expense

        # Previous Month for comparison
        prev_month_date = (now.replace(day=1) - timedelta(days=1))
        prev_month_prefix = prev_month_date.strftime("%Y-%m")
        prev_month_txs = [t for t in all_txs if t.date.startswith(prev_month_prefix)]
        prev_monthly_income = sum(t.amount for t in prev_month_txs if t.type == "income")
        prev_monthly_expense = sum(t.amount for t in prev_month_txs if t.type == "expense")

        return {
            "total_balance": round(total_balance, 2),
            "monthly_income": round(monthly_income, 2),
            "monthly_expense": round(monthly_expense, 2),
            "total_savings": round(monthly_savings, 2),
            "prev_monthly_income": round(prev_monthly_income, 2),
            "prev_monthly_expense": round(prev_monthly_expense, 2),
            "transaction_count": len(all_txs)
        }

    @staticmethod
    def compute_category_breakdown(transactions: List[Transaction]) -> List[Dict[str, Any]]:
        """Compute spending per category with totals and percentages."""
        expenses = [t for t in transactions if t.type == "expense"]
        total_expense = sum(t.amount for t in expenses)

        cat_totals: Dict[str, float] = {}
        for t in expenses:
            cat_totals[t.category] = cat_totals.get(t.category, 0.0) + t.amount

        breakdown = []
        for cat, amt in sorted(cat_totals.items(), key=lambda x: x[1], reverse=True):
            pct = round((amt / total_expense) * 100, 1) if total_expense > 0 else 0.0
            breakdown.append({
                "category": cat,
                "amount": round(amt, 2),
                "percentage": pct
            })
        return breakdown

    @staticmethod
    def compute_cashflow_trends(transactions: List[Transaction], days: int = 14) -> List[Dict[str, Any]]:
        """Generate daily income vs expense series for interactive charts."""
        now = datetime.utcnow()
        dates = [(now - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days - 1, -1, -1)]

        daily_map = {d: {"date": d, "income": 0.0, "expense": 0.0} for d in dates}
        for t in transactions:
            if t.date in daily_map:
                if t.type == "income":
                    daily_map[t.date]["income"] += t.amount
                elif t.type == "expense":
                    daily_map[t.date]["expense"] += t.amount

        return [
            {
                "date": d,
                "income": round(daily_map[d]["income"], 2),
                "expense": round(daily_map[d]["expense"], 2)
            }
            for d in dates
        ]
