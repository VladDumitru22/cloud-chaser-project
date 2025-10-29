from pydantic import BaseModel, EmailStr
from typing import Optional
from models import UserRole
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone_number: Optional[str] = None
    address: Optional[str] = None

class UserOut(BaseModel):
    id_user: int
    name: str
    email: EmailStr
    phone_number: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime
    role: UserRole

    class Config:
        from_atributes = True