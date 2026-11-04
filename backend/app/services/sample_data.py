import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import Transaction, Budget, SavingsGoal, ConnectedBank

def seed_sample_data_for_user(user_id: int, db: Session):
    """Seed realistic Indian financial transactions, budgets, goals, and bank for a new user."""
    today = datetime.now()
    current_year = today.year
    current_month = today.month

    # Generate dates relative to today
    def date_str(days_ago: int) -> str:
        d = today - timedelta(days=days_ago)
        return d.strftime("%Y-%m-%d")

    # Sample transactions (Current month + previous month)
    sample_txs = [
        # Incomes
        {"title": "TechCorp Solutions Salary", "amount": 75000.0, "type": "income", "category": "Salary", "days_ago": 3, "method": "Net Banking", "desc": "Monthly credit"},
        {"title": "Freelance UI Design Project", "amount": 15000.0, "type": "income", "category": "Freelance", "days_ago": 12, "method": "UPI", "desc": "Landing page design payout"},
        {"title": "Previous Month Salary", "amount": 75000.0, "type": "income", "category": "Salary", "days_ago": 33, "method": "Net Banking", "desc": "Monthly credit"},

        # Current Month Expenses
        {"title": "DMart Monthly Groceries", "amount": 4200.0, "type": "expense", "category": "Groceries", "days_ago": 1, "method": "UPI", "desc": "Household groceries & staples"},
        {"title": "Amazon Great Indian Festival", "amount": 5499.0, "type": "expense", "category": "Shopping", "days_ago": 2, "method": "Credit Card", "desc": "Noise-cancelling headphones"},
        {"title": "Swiggy Gourmet Dinner", "amount": 840.0, "type": "expense", "category": "Food and Dining", "days_ago": 2, "method": "UPI", "desc": "Dinner with friends"},
        {"title": "Uber City Premier", "amount": 420.0, "type": "expense", "category": "Transportation", "days_ago": 4, "method": "UPI", "desc": "Commute to tech park"},
        {"title": "Blinkit Quick Delivery", "amount": 650.0, "type": "expense", "category": "Groceries", "days_ago": 5, "method": "UPI", "desc": "Fresh fruits & snacks"},
        {"title": "Cult.fit Annual Pass", "amount": 3200.0, "type": "expense", "category": "Healthcare", "days_ago": 6, "method": "Debit Card", "desc": "Fitness center membership"},
        {"title": "Apartment Maintenance & Rent", "amount": 18000.0, "type": "expense", "category": "Rent and Bills", "days_ago": 7, "method": "Net Banking", "desc": "Monthly apartment rent"},
        {"title": "Zomato Lunch Treat", "amount": 380.0, "type": "expense", "category": "Food and Dining", "days_ago": 8, "method": "UPI", "desc": "Office lunch bowl"},
        {"title": "Bescom Electricity Bill", "amount": 1450.0, "type": "expense", "category": "Rent and Bills", "days_ago": 9, "method": "UPI", "desc": "Monthly power bill"},
        {"title": "Zara Winter Jacket", "amount": 4500.0, "type": "expense", "category": "Shopping", "days_ago": 10, "method": "Credit Card", "desc": "Casual outerwear"},
        {"title": "PVR IMAX Cinema Tickets", "amount": 950.0, "type": "expense", "category": "Entertainment", "days_ago": 11, "method": "UPI", "desc": "Weekend movie"},
        {"title": "Coursera Python ML Specialization", "amount": 2999.0, "type": "expense", "category": "Education", "days_ago": 13, "method": "Credit Card", "desc": "Upskilling course subscription"},
        {"title": "Shell Petrol Station", "amount": 1200.0, "type": "expense", "category": "Transportation", "days_ago": 14, "method": "UPI", "desc": "Fuel refilling"},
        {"title": "Apollo Pharmacy Vitamins", "amount": 890.0, "type": "expense", "category": "Healthcare", "days_ago": 15, "method": "UPI", "desc": "Supplements & meds"},
        {"title": "Personal Grooming Salon", "amount": 1200.0, "type": "expense", "category": "Personal Expenses", "days_ago": 16, "method": "UPI", "desc": "Haircut and spa"},

        # Previous Month Expenses (for wrap comparison)
        {"title": "Prev Rent & Bills", "amount": 18000.0, "type": "expense", "category": "Rent and Bills", "days_ago": 37, "method": "Net Banking", "desc": "Rent"},
        {"title": "Prev Groceries", "amount": 3800.0, "type": "expense", "category": "Groceries", "days_ago": 36, "method": "UPI", "desc": "Groceries"},
        {"title": "Prev Shopping", "amount": 3800.0, "type": "expense", "category": "Shopping", "days_ago": 35, "method": "Credit Card", "desc": "Shopping"},
        {"title": "Prev Dining", "amount": 1900.0, "type": "expense", "category": "Food and Dining", "days_ago": 34, "method": "UPI", "desc": "Dining"},
        {"title": "Prev Transport", "amount": 1600.0, "type": "expense", "category": "Transportation", "days_ago": 33, "method": "UPI", "desc": "Metro & Cabs"},
        {"title": "Prev Entertainment", "amount": 1200.0, "type": "expense", "category": "Entertainment", "days_ago": 32, "method": "UPI", "desc": "Movies"},
    ]

    for item in sample_txs:
        tx = Transaction(
            user_id=user_id,
            title=item["title"],
            amount=item["amount"],
            type=item["type"],
            category=item["category"],
            date=date_str(item["days_ago"]),
            payment_method=item["method"],
            description=item["desc"]
        )
        db.add(tx)

    # Seed Budget
    category_limits = {
        "Rent and Bills": 22000.0,
        "Groceries": 6000.0,
        "Shopping": 7000.0,
        "Food and Dining": 3500.0,
        "Transportation": 3000.0,
        "Entertainment": 2500.0,
        "Healthcare": 4000.0,
        "Personal Expenses": 3000.0,
        "Education": 4000.0,
        "Other Expenses": 3000.0
    }
    budget = Budget(
        user_id=user_id,
        month=current_month,
        year=current_year,
        monthly_limit=55000.0,
        category_budgets=json.dumps(category_limits)
    )
    db.add(budget)

    # Seed Savings Goals
    goals = [
        SavingsGoal(
            user_id=user_id,
            title="MacBook Pro M3 Max",
            target_amount=180000.0,
            current_amount=95000.0,
            target_date=(today + timedelta(days=90)).strftime("%Y-%m-%d"),
            category="Gadgets"
        ),
        SavingsGoal(
            user_id=user_id,
            title="Emergency Fund (6 Months)",
            target_amount=250000.0,
            current_amount=165000.0,
            target_date=(today + timedelta(days=180)).strftime("%Y-%m-%d"),
            category="Emergency"
        ),
        SavingsGoal(
            user_id=user_id,
            title="Japan Trip 2025",
            target_amount=120000.0,
            current_amount=40000.0,
            target_date=(today + timedelta(days=120)).strftime("%Y-%m-%d"),
            category="Travel"
        )
    ]
    for g in goals:
        db.add(g)

    # Seed Demo Connected Bank
    bank = ConnectedBank(
        user_id=user_id,
        bank_name="HDFC Bank",
        account_number_masked="XXXX-XXXX-4892",
        ifsc="HDFC0001245",
        account_type="Savings Account",
        balance=112500.0,
        status="connected",
        last_synced=datetime.utcnow()
    )
    db.add(bank)

    db.commit()

