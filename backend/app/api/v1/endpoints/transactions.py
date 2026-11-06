from typing import Optional, List
from fastapi import APIRouter, Depends, Query, UploadFile, File
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.entities import User
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionResponse
from app.services.transaction_service import TransactionService

router = APIRouter(prefix="/transactions", tags=["transactions"])

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
    """Retrieve filtered and paginated user transactions."""
    return TransactionService.get_transactions(
        db, current_user.id, category, type, search, start_date, end_date, limit, offset
    )

@router.post("", response_model=TransactionResponse)
def create_transaction(
    tx_in: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new manual transaction."""
    return TransactionService.create_transaction(db, current_user.id, tx_in.model_dump())

@router.put("/{tx_id}", response_model=TransactionResponse)
def update_transaction(
    tx_id: int,
    tx_in: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update existing transaction."""
    return TransactionService.update_transaction(db, current_user.id, tx_id, tx_in.model_dump())

@router.delete("/{tx_id}")
def delete_transaction(
    tx_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a transaction."""
    TransactionService.delete_transaction(db, current_user.id, tx_id)
    return {"success": True, "message": "Transaction deleted successfully."}

@router.post("/import-csv")
async def import_csv_transactions(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Bulk import transactions from bank statement CSV."""
    contents = await file.read()
    count = TransactionService.import_from_csv(db, current_user.id, contents)
    return {
        "success": True,
        "imported_count": count,
        "message": f"Successfully imported {count} transactions."
    }
