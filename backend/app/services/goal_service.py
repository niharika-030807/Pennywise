from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.entities import SavingsGoal
from app.core.exceptions import NotFoundException, ValidationException

class GoalService:
    @staticmethod
    def format_goal(g: SavingsGoal) -> Dict[str, Any]:
        """Compute progress and remaining amount."""
        remaining = max(0.0, g.target_amount - g.current_amount)
        pct = min(100.0, round((g.current_amount / g.target_amount * 100), 1)) if g.target_amount > 0 else 0.0

        try:
            target_dt = datetime.strptime(g.target_date, "%Y-%m-%d")
            now = datetime.utcnow()
            months_left = max(1, (target_dt.year - now.year) * 12 + target_dt.month - now.month)
            monthly_rec = round(remaining / months_left, 2)
        except Exception:
            monthly_rec = round(remaining / 6, 2)

        return {
            "id": g.id,
            "title": g.title,
            "target_amount": g.target_amount,
            "current_amount": g.current_amount,
            "target_date": g.target_date,
            "category": g.category or "General",
            "remaining_amount": remaining,
            "progress_percentage": pct,
            "recommended_monthly_savings": monthly_rec
        }

    @classmethod
    def get_user_goals(cls, db: Session, user_id: int) -> List[Dict[str, Any]]:
        goals = db.query(SavingsGoal).filter(SavingsGoal.user_id == user_id).all()
        return [cls.format_goal(g) for g in goals]

    @classmethod
    def create_goal(cls, db: Session, user_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        target_amt = abs(float(data["target_amount"]))
        if target_amt <= 0:
            raise ValidationException("Target amount must be greater than zero.")

        goal = SavingsGoal(
            user_id=user_id,
            title=data["title"].strip(),
            target_amount=target_amt,
            current_amount=0.0,
            target_date=data["target_date"].strip(),
            category=data.get("category") or "General"
        )
        db.add(goal)
        db.commit()
        db.refresh(goal)
        return cls.format_goal(goal)

    @classmethod
    def deposit(cls, db: Session, user_id: int, goal_id: int, amount: float) -> Dict[str, Any]:
        goal = db.query(SavingsGoal).filter(
            SavingsGoal.id == goal_id,
            SavingsGoal.user_id == user_id
        ).first()

        if not goal:
            raise NotFoundException("Savings goal not found.")

        deposit_amt = abs(float(amount))
        goal.current_amount = min(goal.target_amount, goal.current_amount + deposit_amt)
        db.commit()
        db.refresh(goal)
        return cls.format_goal(goal)

    @staticmethod
    def delete_goal(db: Session, user_id: int, goal_id: int) -> bool:
        goal = db.query(SavingsGoal).filter(
            SavingsGoal.id == goal_id,
            SavingsGoal.user_id == user_id
        ).first()

        if not goal:
            raise NotFoundException("Savings goal not found.")

        db.delete(goal)
        db.commit()
        return True
