"""
Pydantic schemas for domain operations.
"""
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field
class DomainCreate(BaseModel):
    """Schema for creating a new domain."""
    domain_name: str = Field(
        ..., min_length=2, max_length=100, description="Domain name"
    )
class DomainUpdate(BaseModel):
    """Schema for updating an existing domain."""
    domain_name: str = Field(
        ..., min_length=2, max_length=100, description="Updated domain name"
    )
class DomainResponse(BaseModel):
    """Schema for domain data in responses."""
    id: UUID
    domain_name: str
    created_at: datetime | None = None
    model_config = {"from_attributes": True}
