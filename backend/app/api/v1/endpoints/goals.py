from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.entities import User
from app.schemas.goal import GoalCreate, GoalDeposit, GoalResponse
from app.services.goal_service import GoalService

router = APIRouter(prefix="/goals", tags=["goals"])

@router.get("", response_model=List[GoalResponse])
def get_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all savings goals with progress and remaining target."""
    return GoalService.get_user_goals(db, current_user.id)

@router.post("", response_model=GoalResponse)
def create_goal(
    req: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new savings goal target."""
    return GoalService.create_goal(db, current_user.id, req.model_dump())

@router.post("/{goal_id}/deposit", response_model=GoalResponse)
def deposit_to_goal(
    goal_id: int,
    req: GoalDeposit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add funds toward a savings goal."""
    return GoalService.deposit(db, current_user.id, goal_id, req.amount)

@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a savings goal."""
    GoalService.delete_goal(db, current_user.id, goal_id)
    return {"success": True, "message": "Savings goal removed."}
