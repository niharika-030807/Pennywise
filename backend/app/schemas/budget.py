from typing import List, Dict
from pydantic import BaseModel

class BudgetCreate(BaseModel):
    month: int
    year: int
    monthly_limit: float
    category_budgets: Dict[str, float] = {}

class BudgetResponse(BaseModel):
    id: int
    month: int
    year: int
    monthly_limit: float
    category_budgets: Dict[str, float]
    total_spent: float
    remaining: float
    progress_percentage: float
    alerts: List[str]
