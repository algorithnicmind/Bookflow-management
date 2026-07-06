import re
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional


class LoginResponse(BaseModel):
    user: dict
    message: str = "Authentication successful"


def validate_password_strength(password: str) -> str:
    """
    Reusable password policy validator.
    Enforces: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character.
    """
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")
    if not re.search(r"[A-Z]", password):
        raise ValueError("Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", password):
        raise ValueError("Password must contain at least one lowercase letter")
    if not re.search(r"\d", password):
        raise ValueError("Password must contain at least one digit")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise ValueError("Password must contain at least one special character (!@#$%^&*...)")
    return password


class AdminCreateRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    gender: Optional[str] = None

    @field_validator("password")
    @classmethod
    def check_password_strength(cls, v):
        return validate_password_strength(v)

