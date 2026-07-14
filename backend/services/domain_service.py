"""
Business logic for domain CRUD operations.
"""
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.models.domain import Domain
from backend.schemas.domain import DomainCreate, DomainUpdate, DomainResponse
from backend.utils.logger import setup_logger
logger = setup_logger(__name__)
def create_domain(request: DomainCreate, db: Session) -> DomainResponse:
    """
    Create a new domain.
    Args:
        request: Domain creation data.
        db: Database session.
    Returns:
        Created domain response.
    Raises:
        HTTPException 400: If domain name already exists.
    """
    existing = (
        db.query(Domain).filter(Domain.domain_name == request.domain_name).first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Domain name already exists",
        )
    domain = Domain(domain_name=request.domain_name)
    db.add(domain)
    db.commit()
    db.refresh(domain)
    logger.info("Domain created: %s (ID: %s)", domain.domain_name, domain.id)
    return DomainResponse.model_validate(domain)
def get_all_domains(db: Session) -> list[DomainResponse]:
    """
    Retrieve all domains.
    Args:
        db: Database session.
    Returns:
        List of domain responses.
    """
    domains = db.query(Domain).order_by(Domain.domain_name).all()
    return [DomainResponse.model_validate(d) for d in domains]
def get_domain_by_id(domain_id: UUID, db: Session) -> DomainResponse:
    """
    Retrieve a single domain by ID.
    Args:
        domain_id: Domain UUID.
        db: Database session.
    Returns:
        Domain response.
    Raises:
        HTTPException 404: If domain not found.
    """
    domain = db.query(Domain).filter(Domain.id == domain_id).first()
    if not domain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found"
        )
    return DomainResponse.model_validate(domain)
def update_domain(
    domain_id: UUID, request: DomainUpdate, db: Session
) -> DomainResponse:
    """
    Update a domain's name.
    Args:
        domain_id: Domain UUID.
        request: Update data.
        db: Database session.
    Returns:
        Updated domain response.
    Raises:
        HTTPException 404: If domain not found.
        HTTPException 400: If new name already exists.
    """
    domain = db.query(Domain).filter(Domain.id == domain_id).first()
    if not domain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found"
        )
    existing = (
        db.query(Domain)
        .filter(Domain.domain_name == request.domain_name, Domain.id != domain_id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Domain name already exists",
        )
    domain.domain_name = request.domain_name
    db.commit()
    db.refresh(domain)
    logger.info("Domain updated: %s (ID: %s)", domain.domain_name, domain.id)
    return DomainResponse.model_validate(domain)
def delete_domain(domain_id: UUID, db: Session) -> dict:
    """
    Delete a domain.
    Args:
        domain_id: Domain UUID.
        db: Database session.
    Returns:
        Success message.
    Raises:
        HTTPException 404: If domain not found.
    """
    domain = db.query(Domain).filter(Domain.id == domain_id).first()
    if not domain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found"
        )
    db.delete(domain)
    db.commit()
    logger.info("Domain deleted: ID %s", domain_id)
    return {"message": "Domain deleted successfully"}
