from typing import Optional
from pydantic import BaseModel

class GoalCreate(BaseModel):
    title: str
    target_amount: float
    target_date: str
    category: Optional[str] = "General"

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    target_amount: Optional[float] = None
    target_date: Optional[str] = None
    category: Optional[str] = None
    current_amount: Optional[float] = None

class GoalContribute(BaseModel):
    amount: float

GoalDeposit = GoalContribute

class GoalResponse(BaseModel):
    id: int
    title: str
    target_amount: float
    current_amount: float
    target_date: str
    category: str
    progress_percentage: float
    remaining_amount: float
    recommended_monthly_savings: Optional[float] = 0.0

    class Config:
        from_attributes = True
