import re
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.entities import User, Transaction, Budget, ChatMessage
from app.core.config import settings
from app.services.analytics_service import AnalyticsService

class AssistantService:
    @staticmethod
    def get_financial_context(db: Session, user: User) -> Dict[str, Any]:
        """Aggregate financial context for AI assistant analysis."""
        now = datetime.utcnow()
        month_str = now.strftime("%Y-%m")

        txs = db.query(Transaction).filter(
            Transaction.user_id == user.id,
            Transaction.date.startswith(month_str)
        ).all()

        income = sum(t.amount for t in txs if t.type == "income")
        expense = sum(t.amount for t in txs if t.type == "expense")
        savings = income - expense
        savings_rate = round((savings / income * 100), 1) if income > 0 else 0.0

        cat_breakdown = AnalyticsService.compute_category_breakdown(txs)
        top_cat = cat_breakdown[0]["category"] if cat_breakdown else "None"
        top_cat_amt = cat_breakdown[0]["amount"] if cat_breakdown else 0.0

        budget = db.query(Budget).filter(
            Budget.user_id == user.id,
            Budget.month == now.month,
            Budget.year == now.year
        ).first()

        budget_limit = budget.monthly_limit if budget else 35000.0
        budget_remaining = max(0.0, budget_limit - expense)

        return {
            "first_name": user.first_name,
            "monthly_income": income,
            "monthly_expense": expense,
            "monthly_savings": savings,
            "savings_rate": savings_rate,
            "tx_count": len(txs),
            "top_category": top_cat,
            "top_cat_amount": top_cat_amt,
            "category_breakdown": [{"name": c["category"], "amount": c["amount"], "pct": c["percentage"]} for c in cat_breakdown],
            "budget_limit": budget_limit,
            "budget_remaining": budget_remaining
        }

    @staticmethod
    def generate_domain_response(user: User, message: str, context: Dict[str, Any]) -> str:
        """Deterministic domain engine providing accurate financial guidance when offline."""
        msg = message.lower()
        expense = context["monthly_expense"]
        income = context["monthly_income"]
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

        if any(k in msg for k in ["how much did i spend", "total spend", "spent this month", "my expenses"]):
            return (
                f"This month, you have spent a total of **₹{expense:,.2f}** across {context['tx_count']} recorded transactions.\n\n"
                f"• **Top Spending Category:** {top_cat} (₹{top_cat_amt:,.2f})\n"
                f"• **Monthly Income Received:** ₹{income:,.2f}\n"
                f"• **Current Net Savings:** ₹{savings:,.2f} ({context['savings_rate']}% savings rate)\n\n"
                f"You have **₹{budget_rem:,.2f}** remaining under your monthly budget cap of ₹{budget_limit:,.2f}."
            )

        elif any(k in msg for k in ["where am i spending", "spending the most", "biggest expense", "highest expense"]):
            breakdown_str = "\n".join([f"• **{c['name']}**: ₹{c['amount']:,.2f} ({c['pct']}%)" for c in categories[:4]])
            return (
                f"Your largest spending category this month is **{top_cat}**, totaling **₹{top_cat_amt:,.2f}** "
                f"({round((top_cat_amt / expense * 100) if expense > 0 else 0, 1)}% of all expenses).\n\n"
                f"**Top Expense Breakdown:**\n{breakdown_str}\n\n"
                f"💡 *Recommendation:* Consider setting a strict weekly sub-limit for {top_cat} to preserve your savings cushion."
            )

        elif any(k in msg for k in ["how much did i save", "my savings", "savings this month", "saved"]):
            return (
                f"You have saved **₹{savings:,.2f}** this month!\n\n"
                f"• **Total Inflows:** ₹{income:,.2f}\n"
                f"• **Total Outflows:** ₹{expense:,.2f}\n"
                f"• **Savings Rate:** **{context['savings_rate']}%**\n\n"
                + ("🌟 *Fantastic performance!* You are well ahead of the classic 20% savings rule." if context['savings_rate'] >= 20 
                   else "⚠️ *Optimization Note:* Try pruning non-essential subscriptions and shopping to hit at least 20% savings.")
            )

        elif "afford" in msg:
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

        elif "shopping" in msg:
            shop_amt = next((c["amount"] for c in categories if "shop" in c["name"].lower()), 0.0)
            shop_pct = round((shop_amt / expense * 100), 1) if expense > 0 else 0
            return (
                f"You have spent **₹{shop_amt:,.2f}** on Shopping this month ({shop_pct}% of total expenditure).\n\n"
                f"**Analysis:**\n"
                f"• Your shopping spend is {shop_pct}% of your total budget.\n"
                f"• Enforce the '48-hour rule' before impulse purchasing on Amazon, Flipkart, or Myntra to save up to ₹1,500/month."
            )

        elif "budget" in msg:
            return (
                f"**Recommended Budget Strategy for Next Month:**\n\n"
                f"1. **Needs (50%):** ₹{round(income * 0.5):,.2f} for rent, groceries, utilities, and healthcare.\n"
                f"2. **Wants (30%):** ₹{round(income * 0.3):,.2f} for dining out, shopping, and entertainment.\n"
                f"3. **Savings & Investments (20%):** ₹{round(income * 0.2):,.2f} directly allocated to emergency fund or index funds.\n\n"
                f"You can customize these exact numbers in the **Budget Planner** tab."
            )

        else:
            return (
                f"Here is your financial status overview, {user.first_name}:\n\n"
                f"• **Monthly Income:** ₹{income:,.2f}\n"
                f"• **Monthly Expenses:** ₹{expense:,.2f}\n"
                f"• **Current Savings:** ₹{savings:,.2f} ({context['savings_rate']}%)\n"
                f"• **Top Expense Category:** {top_cat} (₹{top_cat_amt:,.2f})\n\n"
                f"Ask me questions like:\n"
                f"- *'How much did I spend this month?'*\n"
                f"- *'Where am I spending the most?'*\n"
                f"- *'Can I afford a purchase of ₹5,000?'*\n"
                f"- *'How can I reduce my expenses?'*"
            )

    @classmethod
    def ask_assistant(cls, db: Session, user: User, user_message: str) -> Dict[str, Any]:
        """Processes message, queries AI or fallback rule engine, and records conversation history."""
        # 1. Save user chat message
        user_msg_record = ChatMessage(
            user_id=user.id,
            sender="user",
            message=user_message.strip(),
            timestamp=datetime.utcnow()
        )
        db.add(user_msg_record)

        # 2. Extract live telemetry
        context = cls.get_financial_context(db, user)

        # 3. Try Gemini AI if API key configured
        reply = None
        if settings.GEMINI_API_KEY:
            try:
                from google import genai
                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                prompt = f"""You are Pennywise Financial Companion, an intelligent fintech assistant for an Indian user named {user.first_name}.
Current financial state:
- Monthly Income: ₹{context['monthly_income']:,.2f}
- Monthly Expenses: ₹{context['monthly_expense']:,.2f}
- Monthly Savings: ₹{context['monthly_savings']:,.2f} (Savings Rate: {context['savings_rate']}%)
- Top Category: {context['top_category']} (₹{context['top_cat_amount']:,.2f})
- Remaining Budget: ₹{context['budget_remaining']:,.2f} of ₹{context['budget_limit']:,.2f}
- Recorded Transactions: {context['tx_count']}

User query: "{user_message}"

Answer clearly, practically, and empathetically using Indian Rupee (₹) formatting. Be concise and actionable."""
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                if response and response.text:
                    reply = response.text
            except Exception as e:
                print(f"[GEMINI ASSISTANT ERROR] {e}")

        # Fallback to deterministic financial engine
        if not reply:
            reply = cls.generate_domain_response(user, user_message, context)

        # 4. Save assistant reply
        assistant_record = ChatMessage(
            user_id=user.id,
            sender="assistant",
            message=reply,
            timestamp=datetime.utcnow()
        )
        db.add(assistant_record)
        db.commit()

        suggestions = [
            "How much did I spend this month?",
            "Where am I spending the most?",
            "Can I afford a purchase of ₹5,000?",
            "What should my budget be next month?"
        ]

        return {
            "response": reply,
            "suggestions": suggestions,
            "context": context
        }

    @staticmethod
    def get_history(db: Session, user_id: int, limit: int = 50) -> List[ChatMessage]:
        return db.query(ChatMessage).filter(ChatMessage.user_id == user_id).order_by(
            ChatMessage.timestamp.asc()
        ).limit(limit).all()
