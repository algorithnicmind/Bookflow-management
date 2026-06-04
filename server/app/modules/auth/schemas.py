from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class AdminCreateRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
