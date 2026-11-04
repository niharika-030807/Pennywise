from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, SavingsGoal
from app.schemas import GoalCreate, GoalDeposit, GoalResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/goals", tags=["goals"])

def format_goal(g: SavingsGoal) -> dict:
    remaining = max(0.0, g.target_amount - g.current_amount)
    pct = min(100.0, round((g.current_amount / g.target_amount * 100), 1)) if g.target_amount > 0 else 0.0

    # Calculate recommended monthly savings
    try:
        target_dt = datetime.strptime(g.target_date, "%Y-%m-%d")
        now = datetime.now()
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

@router.get("", response_model=List[GoalResponse])
def get_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goals = db.query(SavingsGoal).filter(SavingsGoal.user_id == current_user.id).all()
    return [format_goal(g) for g in goals]

@router.post("", response_model=GoalResponse)
def create_goal(
    req: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = SavingsGoal(
        user_id=current_user.id,
        title=req.title.strip(),
        target_amount=abs(req.target_amount),
        current_amount=0.0,
        target_date=req.target_date.strip(),
        category=req.category or "General"
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return format_goal(goal)

@router.post("/{goal_id}/deposit", response_model=GoalResponse)
def deposit_to_goal(
    goal_id: int,
    req: GoalDeposit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(SavingsGoal).filter(
        SavingsGoal.id == goal_id,
        SavingsGoal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found.")

    goal.current_amount = min(goal.target_amount, goal.current_amount + abs(req.amount))
    db.commit()
    db.refresh(goal)
    return format_goal(goal)

@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(SavingsGoal).filter(
        SavingsGoal.id == goal_id,
        SavingsGoal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found.")

    db.delete(goal)
    db.commit()
    return {"success": True, "message": "Savings goal removed."}

