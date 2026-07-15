from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: UUID
    complaint_id: UUID
    complaint_title: str | None = None
    complaint_priority: str | None = None
    message: str | None = None
    read_status: bool
    created_at: datetime
    model_config = {"from_attributes": True}
