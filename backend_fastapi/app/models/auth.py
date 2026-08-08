from pydantic import BaseModel, EmailStr
from enum import Enum
from datetime import datetime
from typing import Optional


class UserRole(str, Enum):
    INSTRUCTOR = "INSTRUCTOR"
    MANAGER = "MANAGER"
    EMPLOYEE = "EMPLOYEE"


class SystemUser(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: UserRole
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    rank: Optional[str] = None
    department: Optional[str] = None
    is_active: bool = True
    last_login: Optional[str] = None
    created_at: str


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: SystemUser
