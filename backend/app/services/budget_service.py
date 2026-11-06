import json
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.entities import Budget, Transaction
from app.core.exceptions import ValidationException

class BudgetService:
    @staticmethod
    def get_current_budget_overview(db: Session, user_id: int) -> Dict[str, Any]:
        """Fetch current month budget status, progress, alerts, and recommendations."""
        now = datetime.utcnow()
        month_str = now.strftime("%Y-%m")

        budget = db.query(Budget).filter(
            Budget.user_id == user_id,
            Budget.month == now.month,
            Budget.year == now.year
        ).first()

        # Fetch current month expenses
        txs = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.date.startswith(month_str)
        ).all()

        total_spent = sum(t.amount for t in txs)

        if not budget:
            return {
                "id": None,
                "has_budget": False,
                "month": now.month,
                "year": now.year,
                "monthly_limit": 0.0,
                "total_spent": round(total_spent, 2),
                "remaining": 0.0,
                "progress_percentage": 0.0,
                "category_progress": [],
                "alerts": [],
                "recommendations": [
                    "You haven't set a budget yet. Click 'Modify Budget Targets' to define your monthly spending cap."
                ]
            }

        category_limits: Dict[str, float] = json.loads(budget.category_budgets or "{}")
        remaining = max(0.0, budget.monthly_limit - total_spent)
        progress_pct = min(100.0, round((total_spent / budget.monthly_limit * 100), 1)) if budget.monthly_limit > 0 else 0.0

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
                "remaining": max(0.0, limit - spent),
                "percentage": pct,
                "status": status
            })

        category_progress.sort(key=lambda x: x["percentage"], reverse=True)

        recommendations = []
        if progress_pct > 85:
            recommendations.append("Overall monthly spending is above 85%. Consider cutting discretionary expenses.")
        else:
            recommendations.append("You are currently well within your monthly financial limits. Good job!")

        return {
            "id": budget.id,
            "has_budget": True,
            "month": now.month,
            "year": now.year,
            "monthly_limit": budget.monthly_limit,
            "total_spent": round(total_spent, 2),
            "remaining": round(remaining, 2),
            "progress_percentage": progress_pct,
            "category_progress": category_progress,
            "alerts": alerts,
            "recommendations": recommendations
        }

    @staticmethod
    def set_budget(db: Session, user_id: int, month: int, year: int, monthly_limit: float, category_budgets: Dict[str, float]) -> Budget:
        """Create or update monthly budget."""
        if monthly_limit <= 0:
            raise ValidationException("Monthly budget limit must be greater than zero.")

        budget = db.query(Budget).filter(
            Budget.user_id == user_id,
            Budget.month == month,
            Budget.year == year
        ).first()

        cat_json = json.dumps(category_budgets)

        if budget:
            budget.monthly_limit = monthly_limit
            budget.category_budgets = cat_json
        else:
            budget = Budget(
                user_id=user_id,
                month=month,
                year=year,
                monthly_limit=monthly_limit,
                category_budgets=cat_json
            )
            db.add(budget)

        db.commit()
        db.refresh(budget)
        return budget
