"""
Pydantic schemas for domain head operations.
"""
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field
class DomainHeadCreate(BaseModel):
    """Schema for creating a new domain head (creates a user + domain_head link)."""
    name: str = Field(..., min_length=2, max_length=100, description="Domain head's name")
    email: EmailStr = Field(..., description="Domain head's email")
    password: str = Field(..., min_length=6, max_length=128, description="Password")
    domain_id: UUID = Field(..., description="Domain to assign")
class DomainHeadUpdate(BaseModel):
    """Schema for updating a domain head assignment."""
    name: str | None = Field(None, min_length=2, max_length=100)
    email: EmailStr | None = None
    domain_id: UUID | None = None
class DomainHeadResponse(BaseModel):
    """Schema for domain head data in responses."""
    id: UUID
    user_id: UUID
    domain_id: UUID
    user_name: str | None = None
    user_email: str | None = None
    domain_name: str | None = None
    model_config = {"from_attributes": True}
