import logging
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger("pennywise")

class AppException(Exception):
    """Base application exception."""
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST, detail: str = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.detail = detail or message

class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found", detail: str = None):
        super().__init__(message=message, status_code=status.HTTP_404_NOT_FOUND, detail=detail)

class UnauthorizedException(AppException):
    def __init__(self, message: str = "Authentication required", detail: str = None):
        super().__init__(message=message, status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)

class ForbiddenException(AppException):
    def __init__(self, message: str = "Access denied", detail: str = None):
        super().__init__(message=message, status_code=status.HTTP_403_FORBIDDEN, detail=detail)

class ValidationException(AppException):
    def __init__(self, message: str = "Validation failed", detail: str = None):
        super().__init__(message=message, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)


async def app_exception_handler(request: Request, exc: AppException):
    """Handler for custom application exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message,
            "detail": exc.detail,
            "status_code": exc.status_code
        }
    )

async def http_exception_handler(request: Request, exc: HTTPException):
    """Handler for standard FastAPI HTTPExceptions."""
    detail_msg = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": detail_msg,
            "detail": detail_msg,
            "status_code": exc.status_code
        }
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handler for Pydantic RequestValidationErrors."""
    errors = exc.errors()
    error_messages = [f"{'.'.join(str(loc) for loc in err['loc'])}: {err['msg']}" for err in errors]
    first_error = error_messages[0] if error_messages else "Invalid request data."
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": first_error,
            "detail": error_messages,
            "status_code": status.HTTP_422_UNPROCESSABLE_ENTITY
        }
    )

async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    """Handler for SQLAlchemy database errors."""
    logger.error(f"Database error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "A database error occurred. Your transaction was safely rolled back.",
            "detail": str(exc) if logger.isEnabledFor(logging.DEBUG) else "Internal database error.",
            "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR
        }
    )

async def general_exception_handler(request: Request, exc: Exception):
    """Fallback handler for unhandled exceptions."""
    logger.error(f"Unhandled server error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An unexpected server error occurred. Please try again later.",
            "detail": str(exc),
            "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR
        }
    )
