import csv
import io
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models import User, Transaction
from app.schemas import TransactionCreate, TransactionUpdate, TransactionResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

@router.get("", response_model=List[TransactionResponse])
def get_transactions(
    category: Optional[str] = None,
    type: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)

    if category and category != "All":
        query = query.filter(Transaction.category == category)
    if type and type != "All":
        query = query.filter(Transaction.type == type)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Transaction.title.ilike(search_pattern)) |
            (Transaction.description.ilike(search_pattern)) |
            (Transaction.category.ilike(search_pattern))
        )

    # Sort newest first
    transactions = query.order_by(desc(Transaction.date), desc(Transaction.id)).offset(offset).limit(limit).all()
    return transactions

@router.post("", response_model=TransactionResponse)
def create_transaction(
    tx_in: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx = Transaction(
        user_id=current_user.id,
        title=tx_in.title.strip(),
        amount=abs(tx_in.amount),
        type=tx_in.type.lower(),
        category=tx_in.category.strip(),
        date=tx_in.date.strip(),
        payment_method=tx_in.payment_method or "UPI",
        description=tx_in.description
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx

@router.put("/{tx_id}", response_model=TransactionResponse)
def update_transaction(
    tx_id: int,
    tx_in: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == current_user.id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found.")

    if tx_in.title is not None:
        tx.title = tx_in.title.strip()
    if tx_in.amount is not None:
        tx.amount = abs(tx_in.amount)
    if tx_in.type is not None:
        tx.type = tx_in.type.lower()
    if tx_in.category is not None:
        tx.category = tx_in.category.strip()
    if tx_in.date is not None:
        tx.date = tx_in.date.strip()
    if tx_in.payment_method is not None:
        tx.payment_method = tx_in.payment_method
    if tx_in.description is not None:
        tx.description = tx_in.description

    db.commit()
    db.refresh(tx)
    return tx

@router.delete("/{tx_id}")
def delete_transaction(
    tx_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == current_user.id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found.")

    db.delete(tx)
    db.commit()
    return {"success": True, "message": "Transaction deleted successfully."}

@router.post("/import-csv")
async def import_csv_transactions(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        contents = await file.read()
        decoded = contents.decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(decoded))

        imported_count = 0
        for row in reader:
            # Flexible field matching
            title = row.get("Title") or row.get("Description") or row.get("Name") or "Imported Item"
            amount_str = row.get("Amount") or row.get("Debit") or row.get("Credit") or "0"
            amount = abs(float(str(amount_str).replace(",", "").replace("₹", "").strip()))
            
            tx_type = row.get("Type") or ("expense" if row.get("Debit") else "income")
            tx_type = "expense" if "exp" in tx_type.lower() or "deb" in tx_type.lower() else "income"
            
            category = row.get("Category") or "Other Expenses"
            date = row.get("Date") or datetime.now().strftime("%Y-%m-%d")
            method = row.get("Payment Method") or row.get("Method") or "UPI"
            desc = row.get("Notes") or row.get("Description") or ""

            tx = Transaction(
                user_id=current_user.id,
                title=title.strip(),
                amount=amount,
                type=tx_type,
                category=category.strip(),
                date=date.strip(),
                payment_method=method.strip(),
                description=desc.strip()
            )
            db.add(tx)
            imported_count += 1

        db.commit()
        return {"success": True, "imported_count": imported_count, "message": f"Successfully imported {imported_count} transactions."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

