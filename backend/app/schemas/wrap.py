from typing import List, Dict
from pydantic import BaseModel

class CategorySpend(BaseModel):
    category: str
    amount: float
    percentage: float

class MonthlyWrapResponse(BaseModel):
    month_name: str
    month: int
    year: int
    total_income: float
    total_expenses: float
    total_savings: float
    savings_rate: float
    transaction_count: int
    avg_daily_spend: float
    top_spending_category: str
    top_spending_amount: float
    lowest_spending_category: str
    lowest_spending_amount: float
    category_breakdown: List[CategorySpend]
    comparison_prev_month: Dict[str, float]
    personalized_insights: List[str]
