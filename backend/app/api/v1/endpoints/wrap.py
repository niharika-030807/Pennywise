from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.entities import User
from app.services.wrap_service import WrapService

router = APIRouter(prefix="/wrap", tags=["wrap"])

@router.get("/summary")
def get_monthly_wrap(
    month: Optional[int] = None,
    year: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate comprehensive Spotify-style Monthly Money Wrap analytics."""
    return WrapService.generate_monthly_wrap(db, current_user.id, month, year)
