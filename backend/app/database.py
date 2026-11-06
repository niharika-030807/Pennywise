"""Backward-compatible database shim."""
from app.core.database import engine, Base, SessionLocal, get_db

__all__ = ["engine", "Base", "SessionLocal", "get_db"]
