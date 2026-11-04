import json
import re
from datetime import datetime
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.config import settings
from app.database import get_db
from app.models import User, Transaction, Budget, SavingsGoal, ChatMessage
from app.schemas import ChatRequest, ChatResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/assistant", tags=["assistant"])

def generate_local_financial_reply(user: User, message: str, context: dict) -> str:
    """Generate an intelligent, personalized financial response using actual user data."""
    msg = message.lower()
    income = context["monthly_income"]
    expense = context["monthly_expense"]
    savings = context["monthly_savings"]
    top_cat = context["top_category"]
    top_cat_amt = context["top_cat_amount"]
    categories = context["category_breakdown"]
    budget_limit = context["budget_limit"]
    budget_rem = context["budget_remaining"]

    if context["tx_count"] == 0:
        return (
            f"Hello {user.first_name}! You have no transactions recorded for this month yet.\n\n"
            f"• **Recorded Outflows:** ₹0.00\n"
            f"• **Recorded Inflows:** ₹0.00\n\n"
            f"To get started, click the **Add Expense** button at the top right to record your first transaction, or import a CSV statement. Once you add entries, I will automatically analyze your habits and generate personalized advice!"
        )

    # 1. "How much did I spend this month?" / "Total spent"
    if any(k in msg for k in ["how much did i spend", "total spend", "spent this month", "my expenses"]):
        return (
            f"This month, you have spent a total of **₹{expense:,.2f}** across {context['tx_count']} recorded transactions.\n\n"
            f"• **Top Spending Category:** {top_cat} (₹{top_cat_amt:,.2f})\n"
            f"• **Monthly Income Received:** ₹{income:,.2f}\n"
            f"• **Current Net Savings:** ₹{savings:,.2f} ({context['savings_rate']}% savings rate)\n\n"
            f"You have **₹{budget_rem:,.2f}** remaining under your monthly budget cap of ₹{budget_limit:,.2f}."
        )

    # 2. "Where am I spending the most?" / "Top category"
    elif any(k in msg for k in ["where am i spending", "spending the most", "biggest expense", "highest expense"]):
        breakdown_str = "\n".join([f"• **{c['name']}**: ₹{c['amount']:,.2f} ({c['pct']}%)" for c in categories[:4]])
        return (
            f"Your largest spending category this month is **{top_cat}**, totaling **₹{top_cat_amt:,.2f}** "
            f"({round((top_cat_amt / expense * 100) if expense > 0 else 0, 1)}% of all expenses).\n\n"
            f"**Top Expense Breakdown:**\n{breakdown_str}\n\n"
            f"💡 *Recommendation:* Consider setting a strict weekly sub-limit for {top_cat} to preserve your savings cushion."
        )

    # 3. "How much money did I save?"
    elif any(k in msg for k in ["how much did i save", "my savings", "savings this month", "saved"]):
        return (
            f"You have saved **₹{savings:,.2f}** this month!\n\n"
            f"• **Total Inflows:** ₹{income:,.2f}\n"
            f"• **Total Outflows:** ₹{expense:,.2f}\n"
            f"• **Savings Rate:** **{context['savings_rate']}%**\n\n"
            + ("🌟 *Fantastic performance!* You are well ahead of the classic 20% savings rule." if context['savings_rate'] >= 20 
               else "⚠️ *Optimization Note:* Try pruning non-essential subscriptions and shopping to hit at least 20% savings.")
        )

    # 4. "Can I afford a purchase of ₹..."
    elif "afford" in msg:
        # Extract potential amount from query
        numbers = re.findall(r'\d+', msg.replace(",", ""))
        purchase_amt = float(numbers[0]) if numbers else 5000.0

        if purchase_amt <= budget_rem:
            safe_rem = budget_rem - purchase_amt
            return (
                f"**Yes, you can afford a purchase of ₹{purchase_amt:,.2f}!**\n\n"
                f"• **Remaining Budget:** ₹{budget_rem:,.2f}\n"
                f"• **Budget After Purchase:** ₹{safe_rem:,.2f}\n"
                f"• **Projected Monthly Savings:** ₹{max(0.0, savings - purchase_amt):,.2f}\n\n"
                f"This purchase keeps you within your ₹{budget_limit:,.2f} monthly budget without compromising essential obligations."
            )
        else:
            deficit = purchase_amt - budget_rem
            return (
                f"**Caution:** Making a purchase of ₹{purchase_amt:,.2f} would exceed your remaining monthly budget by **₹{deficit:,.2f}**.\n\n"
                f"• **Current Remaining Budget:** ₹{budget_rem:,.2f}\n"
                f"• **Total Spent Already:** ₹{expense:,.2f} / ₹{budget_limit:,.2f}\n\n"
                f"💡 *Alternative:* Postpone this purchase to the start of next month or reallocate ₹{deficit:,.2f} from discretionary categories like {top_cat}."
            )

    # 5. "Am I spending too much on shopping?"
    elif "shopping" in msg:
        shop_amt = next((c["amount"] for c in categories if "shop" in c["name"].lower()), 0.0)
        shop_pct = round((shop_amt / expense * 100), 1) if expense > 0 else 0
        return (
            f"You have spent **₹{shop_amt:,.2f}** on Shopping this month ({shop_pct}% of total expenditure).\n\n"
            f"**Analysis:**\n"
            + (f"• Your shopping spend is relatively high ({shop_pct}%).\n"
               f"• Reducing shopping expenses by ₹1,000 to ₹1,500 next month would directly fund your savings goals.\n"
               f"• Enforce the '48-hour rule' before checking out items on Amazon or retail apps to curb impulse buying."
               if shop_pct > 15 else
               f"• Your shopping spend is well contained at {shop_pct}% of total outflow. Keep up the disciplined habit!")
        )

    # 6. "How can I reduce my expenses?" / "Manage finances better" / "Budget recommendations"
    else:
        return (
            f"Based on your actual financial records for this month:\n\n"
            f"**Your Financial Snapshot:**\n"
            f"• Monthly Inflows: **₹{income:,.2f}**\n"
            f"• Monthly Outflows: **₹{expense:,.2f}**\n"
            f"• Top Category: **{top_cat} (₹{top_cat_amt:,.2f})**\n\n"
            f"**My Tailored Action Plan for You:**\n"
            f"1. **Trim {top_cat}:** Set a hard cap of ₹{max(1000.0, round(top_cat_amt * 0.8)):,.0f} next month to free up ₹{round(top_cat_amt * 0.2):,.0f}.\n"
            f"2. **Automate Savings:** Direct ₹{max(5000.0, round(income * 0.25)):,.0f} directly into your savings goals right on payday.\n"
            f"3. **Emergency Cushion:** Maintain at least ₹50,000 in liquid savings for unplanned medical or household events.\n"
            f"4. **Smart UPI Tagging:** Continue tracking micro-expenses so zero rupees slip past unnoticed.\n\n"
            f"Would you like me to suggest category-wise budget caps for next month?"
        )

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    now = datetime.now()
    month_str = now.strftime("%Y-%m")

    # Fetch user transactions for the current month
    txs = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.date.startswith(month_str)
    ).all()

    income = sum(t.amount for t in txs if t.type == "income")
    expense = sum(t.amount for t in txs if t.type == "expense")
    savings = income - expense
    savings_rate = round((savings / income * 100), 1) if income > 0 else 0.0

    # Category breakdown
    cat_map: Dict[str, float] = {}
    for t in txs:
        if t.type == "expense":
            cat_map[t.category] = cat_map.get(t.category, 0.0) + t.amount

    cat_list = [
        {"name": k, "amount": v, "pct": round((v / expense * 100), 1) if expense > 0 else 0}
        for k, v in sorted(cat_map.items(), key=lambda x: x[1], reverse=True)
    ]
    top_cat = cat_list[0]["name"] if cat_list else "General Expenses"
    top_cat_amt = cat_list[0]["amount"] if cat_list else 0.0

    budget = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.month == now.month,
        Budget.year == now.year
    ).first()
    budget_limit = budget.monthly_limit if budget else 50000.0
    budget_rem = max(0.0, budget_limit - expense)

    context = {
        "monthly_income": income,
        "monthly_expense": expense,
        "monthly_savings": savings,
        "savings_rate": savings_rate,
        "top_category": top_cat,
        "top_cat_amount": top_cat_amt,
        "category_breakdown": cat_list,
        "budget_limit": budget_limit,
        "budget_remaining": budget_rem,
        "tx_count": len(txs)
    }

    # Save user message to database
    user_msg_db = ChatMessage(user_id=current_user.id, sender="user", message=req.message)
    db.add(user_msg_db)
    db.commit()

    reply_text = None

    # Try Gemini API if key is present
    if settings.GEMINI_API_KEY:
        try:
            from google import genai
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            system_prompt = f"""You are Pennywise Financial Companion, an intelligent, empathetic fintech advisor.
The user is {current_user.first_name}. Currency is Indian Rupees (₹).
User's REAL current month financial data:
- Monthly Income: ₹{income:,.2f}
- Monthly Expenses: ₹{expense:,.2f}
- Current Savings: ₹{savings:,.2f} ({savings_rate}% savings rate)
- Top Spending Category: {top_cat} (₹{top_cat_amt:,.2f})
- Monthly Budget Limit: ₹{budget_limit:,.2f} (Remaining: ₹{budget_rem:,.2f})
- Recent Category Breakdown: {json.dumps(cat_list[:5])}

Rules:
1. Always ground your analysis on their REAL numbers above. Never invent fake transactions.
2. Be concise, actionable, and structured with bullet points.
3. Use ₹ for all currency values.
4. Provide practical, high-impact suggestions."""

            response = client.models.generate_content(
                model="gemini-3.8-flash",
                contents=f"{system_prompt}\n\nUser Question: {req.message}"
            )
            if response and response.text:
                reply_text = response.text
        except Exception as e:
            print("Gemini API call error (falling back to financial engine):", e)

    # Fallback to smart financial reasoning engine if Gemini not configured or fails
    if not reply_text:
        reply_text = generate_local_financial_reply(current_user, req.message, context)

    # Save assistant message to database
    bot_msg_db = ChatMessage(user_id=current_user.id, sender="assistant", message=reply_text)
    db.add(bot_msg_db)
    db.commit()

    return {
        "reply": reply_text,
        "suggestions": [
            "How much did I spend this month?",
            "Where am I spending the most?",
            "Can I afford a purchase of ₹5,000?",
            "How can I reduce my expenses?",
            "What should my budget be next month?"
        ],
        "insights": context
    }

@router.get("/history")
def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    history = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id
    ).order_by(ChatMessage.id.asc()).limit(50).all()

    return [
        {
            "id": h.id,
            "sender": h.sender,
            "message": h.message,
            "timestamp": h.timestamp.isoformat()
        }
        for h in history
    ]
