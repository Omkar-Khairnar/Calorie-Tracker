from typing import Optional
from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime

class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    timezone: Optional[str] = "UTC"

class UserCreate(UserBase):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

class TokenPayload(BaseModel):
    sub: Optional[str] = None
