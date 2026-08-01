from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field


class ComplaintCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=255, description="Complaint title")
    description: str = Field(..., min_length=10, description="Complaint description")
    domain_id: UUID | None = Field(None, description="Selected domain ID")


class ComplaintUpdate(BaseModel):
    status: str | None = Field(
        None,
        description="New status: Submitted, Under Review, In Progress, Resolved, Closed",
    )
    remarks: str | None = Field(None, description="Domain head remarks")


class ComplaintResponse(BaseModel):
    id: UUID
    title: str
    description: str
    domain_id: UUID | None
    domain_name: str | None = None
    priority: str
    status: str
    ai_reason: str | None = None
    assigned_domain_head: UUID | None = None
    domain_head_name: str | None = None
    remarks: str | None = None
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class ComplaintDetailResponse(BaseModel):
    id: UUID
    title: str
    description: str
    domain_id: UUID | None
    domain_name: str | None = None
    priority: str
    status: str
    ai_reason: str | None = None
    assigned_domain_head: UUID | None = None
    domain_head_name: str | None = None
    remarks: str | None = None
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class ComplaintSubmitResponse(BaseModel):
    id: UUID
    title: str
    priority: str
    status: str
    domain_name: str | None = None
    ai_reason: str | None = None
    created_at: datetime
