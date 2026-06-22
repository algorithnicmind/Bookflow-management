from pydantic import BaseModel, EmailStr
from typing import Optional


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class AdminCreateRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    gender: Optional[str] = None
