from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


class DomainHeadCreate(BaseModel):
    user_id: UUID = Field(..., description="User ID to assign as domain head")
    domain_id: UUID = Field(..., description="Domain to assign")


class DomainHeadUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    email: EmailStr | None = None
    domain_id: UUID | None = None


class DomainHeadResponse(BaseModel):
    id: UUID
    user_id: UUID
    domain_id: UUID
    user_name: str | None = None
    user_email: str | None = None
    domain_name: str | None = None
    model_config = {"from_attributes": True}
