from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.models.user import User
from backend.models.domain import Domain
from backend.models.domain_head import DomainHead
from backend.auth.hashing import hash_password
from backend.schemas.domain_head import (
    DomainHeadCreate,
    DomainHeadUpdate,
    DomainHeadResponse,
)
from backend.utils.logger import setup_logger

logger = setup_logger(__name__)


def _build_response(dh: DomainHead, db: Session) -> DomainHeadResponse:
    user = db.query(User).filter(User.id == dh.user_id).first()
    domain = db.query(Domain).filter(Domain.id == dh.domain_id).first()
    return DomainHeadResponse(
        id=dh.id,
        user_id=dh.user_id,
        domain_id=dh.domain_id,
        user_name=user.name if user else None,
        user_email=user.email if user else None,
        domain_name=domain.domain_name if domain else None,
    )


def create_domain_head(request: DomainHeadCreate, db: Session) -> DomainHeadResponse:
    domain = db.query(Domain).filter(Domain.id == request.domain_id).first()
    if not domain:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Domain not found",
        )
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found",
        )
    if user.role != "domain_head":
        user.role = "domain_head"
    
    existing_link = db.query(DomainHead).filter(DomainHead.user_id == user.id, DomainHead.domain_id == domain.id).first()
    if existing_link:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already head of this domain",
        )
        
    domain_head = DomainHead(
        user_id=user.id,
        domain_id=request.domain_id,
    )
    db.add(domain_head)
    db.commit()
    db.refresh(domain_head)
    logger.info("Domain head created: %s for domain %s", user.email, domain.domain_name)
    
    # Check for unassigned complaints in this domain and assign them
    try:
        from backend.models.complaint import Complaint
        from backend.models.notification import Notification
        unassigned_complaints = (
            db.query(Complaint)
            .filter(Complaint.domain_id == domain.id, Complaint.assigned_domain_head == None, Complaint.status.in_(["Submitted", "Under Review"]))
            .all()
        )
        for complaint in unassigned_complaints:
            complaint.assigned_domain_head = domain_head.id
            notification = Notification(
                complaint_id=complaint.id,
                user_id=user.id,
                message=f"New {complaint.priority} complaint assigned to you: {complaint.title}",
            )
            db.add(notification)
        db.commit()
    except Exception as e:
        logger.error("Failed to retroactively assign complaints to new domain head: %s", str(e))
        db.rollback()

    return _build_response(domain_head, db)


def get_all_domain_heads(db: Session) -> list[DomainHeadResponse]:
    domain_heads = db.query(DomainHead).all()
    return [_build_response(dh, db) for dh in domain_heads]


def get_domain_head_by_id(domain_head_id: UUID, db: Session) -> DomainHeadResponse:
    dh = db.query(DomainHead).filter(DomainHead.id == domain_head_id).first()
    if not dh:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Domain head not found"
        )
    return _build_response(dh, db)


def update_domain_head(
    domain_head_id: UUID, request: DomainHeadUpdate, db: Session
) -> DomainHeadResponse:
    dh = db.query(DomainHead).filter(DomainHead.id == domain_head_id).first()
    if not dh:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Domain head not found"
        )
    user = db.query(User).filter(User.id == dh.user_id).first()
    if request.name is not None:
        user.name = request.name
    if request.email is not None:
        existing = (
            db.query(User)
            .filter(User.email == request.email, User.id != user.id)
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use",
            )
        user.email = request.email
    if request.domain_id is not None:
        domain = db.query(Domain).filter(Domain.id == request.domain_id).first()
        if not domain:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Domain not found",
            )
        dh.domain_id = request.domain_id
    db.commit()
    db.refresh(dh)
    logger.info("Domain head updated: ID %s", domain_head_id)
    return _build_response(dh, db)


def delete_domain_head(domain_head_id: UUID, db: Session) -> dict:
    dh = db.query(DomainHead).filter(DomainHead.id == domain_head_id).first()
    if not dh:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Domain head not found"
        )
    user = db.query(User).filter(User.id == dh.user_id).first()
    if user:
        db.delete(user)
    db.commit()
    logger.info("Domain head deleted: ID %s", domain_head_id)
    return {"message": "Domain head deleted successfully"}
