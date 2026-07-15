from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.auth.dependencies import require_admin
from backend.models.user import User
from backend.models.domain import Domain
from backend.models.domain_head import DomainHead
from backend.models.complaint import Complaint
from backend.schemas.auth import UserResponse
from backend.schemas.domain_head import (
    DomainHeadCreate,
    DomainHeadUpdate,
    DomainHeadResponse,
)
from backend.services.domain_head_service import (
    create_domain_head,
    get_all_domain_heads,
    get_domain_head_by_id,
    update_domain_head,
    delete_domain_head,
)

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.post("/domain-heads", response_model=DomainHeadResponse, status_code=201)
def add_domain_head(
    request: DomainHeadCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return create_domain_head(request, db)


@router.get("/domain-heads", response_model=list[DomainHeadResponse])
def list_domain_heads(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return get_all_domain_heads(db)


@router.get("/domain-heads/{dh_id}", response_model=DomainHeadResponse)
def get_domain_head(
    dh_id: UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return get_domain_head_by_id(dh_id, db)


@router.put("/domain-heads/{dh_id}", response_model=DomainHeadResponse)
def edit_domain_head(
    dh_id: UUID,
    request: DomainHeadUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return update_domain_head(dh_id, request, db)


@router.delete("/domain-heads/{dh_id}")
def remove_domain_head(
    dh_id: UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return delete_domain_head(dh_id, db)


@router.get("/users", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [UserResponse.model_validate(u) for u in users]


@router.get("/statistics")
def admin_statistics(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    total_users = db.query(User).count()
    total_complaints = db.query(Complaint).count()
    total_domain_heads = db.query(DomainHead).count()
    total_domains = db.query(Domain).count()
    resolved = (
        db.query(Complaint).filter(Complaint.status.in_(["Resolved", "Closed"])).count()
    )
    pending = (
        db.query(Complaint)
        .filter(Complaint.status.in_(["Submitted", "Under Review", "In Progress"]))
        .count()
    )
    high_priority = (
        db.query(Complaint).filter(Complaint.priority.in_(["P1", "P2"])).count()
    )
    return {
        "total_users": total_users,
        "total_complaints": total_complaints,
        "total_domain_heads": total_domain_heads,
        "total_domains": total_domains,
        "resolved_complaints": resolved,
        "pending_complaints": pending,
        "high_priority_complaints": high_priority,
    }
