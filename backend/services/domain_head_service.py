"""
Business logic for domain head management.
"""
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
    """Build a DomainHeadResponse with joined user and domain names."""
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
def create_domain_head(
    request: DomainHeadCreate, db: Session
) -> DomainHeadResponse:
    """
    Create a new domain head: creates a user with role 'domain_head' and links to a domain.
    Args:
        request: Domain head creation data.
        db: Database session.
    Returns:
        Created domain head response with user and domain info.
    Raises:
        HTTPException 400: If email exists or domain not found.
    """
    domain = db.query(Domain).filter(Domain.id == request.domain_id).first()
    if not domain:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Domain not found",
        )
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    user = User(
        name=request.name,
        email=request.email,
        password_hash=hash_password(request.password),
        role="domain_head",
    )
    db.add(user)
    db.flush()  
    domain_head = DomainHead(
        user_id=user.id,
        domain_id=request.domain_id,
    )
    db.add(domain_head)
    db.commit()
    db.refresh(domain_head)
    logger.info(
        "Domain head created: %s for domain %s", user.email, domain.domain_name
    )
    return _build_response(domain_head, db)
def get_all_domain_heads(db: Session) -> list[DomainHeadResponse]:
    """
    Retrieve all domain heads with user and domain info.
    Args:
        db: Database session.
    Returns:
        List of domain head responses.
    """
    domain_heads = db.query(DomainHead).all()
    return [_build_response(dh, db) for dh in domain_heads]
def get_domain_head_by_id(
    domain_head_id: UUID, db: Session
) -> DomainHeadResponse:
    """
    Retrieve a single domain head by ID.
    Args:
        domain_head_id: DomainHead UUID.
        db: Database session.
    Returns:
        Domain head response.
    Raises:
        HTTPException 404: If not found.
    """
    dh = db.query(DomainHead).filter(DomainHead.id == domain_head_id).first()
    if not dh:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Domain head not found"
        )
    return _build_response(dh, db)
def update_domain_head(
    domain_head_id: UUID, request: DomainHeadUpdate, db: Session
) -> DomainHeadResponse:
    """
    Update a domain head's user details or domain assignment.
    Args:
        domain_head_id: DomainHead UUID.
        request: Update data.
        db: Database session.
    Returns:
        Updated domain head response.
    Raises:
        HTTPException 404: If domain head not found.
        HTTPException 400: If new domain not found or email conflict.
    """
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
    """
    Delete a domain head (also deletes the associated user).
    Args:
        domain_head_id: DomainHead UUID.
        db: Database session.
    Returns:
        Success message.
    Raises:
        HTTPException 404: If not found.
    """
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
