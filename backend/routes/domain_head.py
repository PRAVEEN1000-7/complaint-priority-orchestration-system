from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.auth.dependencies import require_domain_head
from backend.models.user import User
from backend.schemas.complaint import (
    ComplaintUpdate,
    ComplaintResponse,
    ComplaintDetailResponse,
)
from backend.services.complaint_service import (
    get_complaints_for_domain_head,
    update_complaint,
)

router = APIRouter(prefix="/api/domain-head", tags=["Domain Head"])


@router.get("/complaints", response_model=list[ComplaintResponse])
def domain_head_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_domain_head),
):
    return get_complaints_for_domain_head(current_user.id, db)


@router.put("/status/{complaint_id}", response_model=ComplaintDetailResponse)
def update_complaint_status(
    complaint_id: UUID,
    request: ComplaintUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_domain_head),
):
    return update_complaint(complaint_id, request, current_user.id, db)
