"""
Complaint API routes.
"""
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.auth.dependencies import get_current_user, require_domain_head
from backend.models.user import User
from backend.schemas.complaint import (
    ComplaintCreate,
    ComplaintUpdate,
    ComplaintResponse,
    ComplaintDetailResponse,
    ComplaintSubmitResponse,
)
from backend.services.complaint_service import (
    submit_complaint,
    get_complaints_for_user,
    get_complaints_for_domain_head,
    get_all_complaints,
    get_complaint_detail,
    update_complaint,
)
router = APIRouter(prefix="/api/complaints", tags=["Complaints"])
@router.post("", response_model=ComplaintSubmitResponse, status_code=201)
def create_complaint(
    request: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Submit a new complaint.
    Triggers the AI orchestrator for automatic analysis.
    Available to authenticated users.
    """
    return submit_complaint(request, current_user.id, db)
@router.get("", response_model=list[ComplaintResponse])
def list_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List complaints based on the current user's role:
    - User: own complaints
    - Domain Head: assigned complaints (sorted by priority)
    - Admin: all complaints
    """
    if current_user.role == "admin":
        return get_all_complaints(db)
    elif current_user.role == "domain_head":
        return get_complaints_for_domain_head(current_user.id, db)
    else:
        return get_complaints_for_user(current_user.id, db)
@router.get("/{complaint_id}", response_model=ComplaintDetailResponse)
def get_complaint(
    complaint_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get detailed view of a single complaint.
    Available to all authenticated users (complaint creator identity is hidden).
    """
    return get_complaint_detail(complaint_id, db)
@router.put("/{complaint_id}", response_model=ComplaintDetailResponse)
def edit_complaint(
    complaint_id: UUID,
    request: ComplaintUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update a complaint's status and/or remarks.
    Available to domain heads and admins.
    """
    if current_user.role not in ("domain_head", "admin"):
        from fastapi import HTTPException, status as http_status
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Only domain heads and admins can update complaints",
        )
    return update_complaint(complaint_id, request, current_user.id, db)
