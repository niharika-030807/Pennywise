from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.entities import User
from app.schemas.budget import BudgetCreate
from app.services.budget_service import BudgetService

router = APIRouter(prefix="/budgets", tags=["budgets"])

@router.get("/current")
def get_current_budget(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve active budget performance and spending progress."""
    return BudgetService.get_current_budget_overview(db, current_user.id)

@router.post("")
def set_or_update_budget(
    req: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create or update monthly budget and category limits."""
    budget = BudgetService.set_budget(
        db, current_user.id, req.month, req.year, req.monthly_limit, req.category_budgets
    )
    return BudgetService.get_current_budget_overview(db, current_user.id)
