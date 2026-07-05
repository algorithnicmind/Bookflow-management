"""
Standardized Error Response Classes
------------------------------------
Provides a consistent error hierarchy for the entire API.
All errors return a uniform JSON shape:
    {
        "error": "ERROR_CODE",
        "message": "Human-readable description",
        "details": { ... },
        "request_id": "uuid"
    }

Usage:
    raise NotFoundError("Employee", "42")
    raise ValidationError("Password must be at least 8 characters")
    raise ForbiddenError("You don't have permission to access this resource")
"""

from fastapi import Request
from fastapi.responses import JSONResponse


class APIError(Exception):
    """Base class for all API errors with a consistent response format."""
    def __init__(self, code: str, message: str, status_code: int = 400, details: dict = None):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class NotFoundError(APIError):
    """Raised when a requested resource does not exist."""
    def __init__(self, resource: str, identifier: str = None):
        msg = f"{resource} not found" if not identifier else f"{resource} with id '{identifier}' not found"
        super().__init__("NOT_FOUND", msg, 404)


class ValidationError(APIError):
    """Raised when input validation fails at the business logic layer."""
    def __init__(self, message: str, details: dict = None):
        super().__init__("VALIDATION_ERROR", message, 422, details)


class ForbiddenError(APIError):
    """Raised when the user lacks permission for the requested operation."""
    def __init__(self, message: str = "You don't have permission to perform this action"):
        super().__init__("FORBIDDEN", message, 403)


class ConflictError(APIError):
    """Raised when the operation conflicts with existing state (e.g., duplicate email)."""
    def __init__(self, message: str, details: dict = None):
        super().__init__("CONFLICT", message, 409, details)


async def api_error_handler(request: Request, exc: APIError) -> JSONResponse:
    """
    Global exception handler registered on the FastAPI app.
    Extracts request_id from request state (set by the Request-ID middleware).
    """
    request_id = getattr(request.state, "request_id", None)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.code,
            "message": exc.message,
            "details": exc.details,
            "request_id": request_id,
        }
    )
