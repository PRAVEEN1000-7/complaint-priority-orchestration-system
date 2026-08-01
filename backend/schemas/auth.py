from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="User's full name")
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=6, max_length=128, description="Password")
    confirm_password: str = Field(
        ..., min_length=6, max_length=128, description="Password confirmation"
    )

class UserCreateAdmin(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="User's full name")
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=6, max_length=128, description="Password")
    role: str = Field(..., description="User's role (admin, domain_head, user)")


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    role: str
    created_at: datetime
    model_config = {"from_attributes": True}
