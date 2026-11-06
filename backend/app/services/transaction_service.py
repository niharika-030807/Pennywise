import csv
import io
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.entities import Transaction
from app.core.exceptions import NotFoundException, ValidationException

class TransactionService:
    @staticmethod
    def get_transactions(
        db: Session,
        user_id: int,
        category: Optional[str] = None,
        type: Optional[str] = None,
        search: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Transaction]:
        """Fetch filtered and paginated transactions for a user."""
        query = db.query(Transaction).filter(Transaction.user_id == user_id)

        if category and category != "All":
            query = query.filter(Transaction.category == category)
        if type and type != "All":
            query = query.filter(Transaction.type == type)
        if start_date:
            query = query.filter(Transaction.date >= start_date)
        if end_date:
            query = query.filter(Transaction.date <= end_date)
        if search:
            search_pat = f"%{search}%"
            query = query.filter(
                (Transaction.title.ilike(search_pat)) |
                (Transaction.description.ilike(search_pat)) |
                (Transaction.category.ilike(search_pat))
            )

        return query.order_by(desc(Transaction.date), desc(Transaction.id)).offset(offset).limit(limit).all()

    @staticmethod
    def create_transaction(db: Session, user_id: int, data: Dict[str, Any]) -> Transaction:
        """Create new transaction record."""
        tx = Transaction(
            user_id=user_id,
            title=data["title"].strip(),
            amount=abs(float(data["amount"])),
            type=data["type"].lower(),
            category=data["category"].strip(),
            date=data["date"].strip(),
            payment_method=data.get("payment_method") or "UPI",
            description=data.get("description")
        )
        db.add(tx)
        db.commit()
        db.refresh(tx)
        return tx

    @staticmethod
    def update_transaction(db: Session, user_id: int, tx_id: int, data: Dict[str, Any]) -> Transaction:
        """Update existing transaction."""
        tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == user_id).first()
        if not tx:
            raise NotFoundException("Transaction not found.")

        for field in ["title", "category", "date", "payment_method", "description"]:
            if data.get(field) is not None:
                setattr(tx, field, str(data[field]).strip())

        if data.get("amount") is not None:
            tx.amount = abs(float(data["amount"]))
        if data.get("type") is not None:
            tx.type = str(data["type"]).lower()

        db.commit()
        db.refresh(tx)
        return tx

    @staticmethod
    def delete_transaction(db: Session, user_id: int, tx_id: int) -> bool:
        """Delete transaction."""
        tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == user_id).first()
        if not tx:
            raise NotFoundException("Transaction not found.")

        db.delete(tx)
        db.commit()
        return True

    @staticmethod
    def import_from_csv(db: Session, user_id: int, csv_content: bytes) -> int:
        """Parse and insert transactions from CSV string."""
        try:
            decoded = csv_content.decode("utf-8-sig")
            reader = csv.DictReader(io.StringIO(decoded))
            count = 0

            for row in reader:
                title = row.get("Title") or row.get("Description") or row.get("Name") or "Imported Transaction"
                amount_str = row.get("Amount") or row.get("Debit") or row.get("Credit") or "0"
                amount = abs(float(str(amount_str).replace(",", "").replace("₹", "").strip()))

                tx_type = row.get("Type") or ("expense" if row.get("Debit") else "income")
                tx_type = "expense" if "exp" in tx_type.lower() or "deb" in tx_type.lower() else "income"

                category = row.get("Category") or "Other Expenses"
                date_str = row.get("Date") or datetime.utcnow().strftime("%Y-%m-%d")
                method = row.get("Payment Method") or row.get("Method") or "UPI"
                desc_val = row.get("Notes") or row.get("Description") or ""

                tx = Transaction(
                    user_id=user_id,
                    title=title.strip(),
                    amount=amount,
                    type=tx_type,
                    category=category.strip(),
                    date=date_str.strip(),
                    payment_method=method.strip(),
                    description=desc_val.strip()
                )
                db.add(tx)
                count += 1

            db.commit()
            return count
        except Exception as e:
            db.rollback()
            raise ValidationException(f"Failed to parse CSV file: {str(e)}")
