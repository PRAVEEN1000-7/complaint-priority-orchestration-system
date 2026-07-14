"""
Domain API routes.
"""
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.auth.dependencies import get_current_user, require_admin
from backend.models.user import User
from backend.schemas.domain import DomainCreate, DomainUpdate, DomainResponse
from backend.services.domain_service import (
    create_domain,
    get_all_domains,
    get_domain_by_id,
    update_domain,
    delete_domain,
)
router = APIRouter(prefix="/api/domains", tags=["Domains"])
@router.get("", response_model=list[DomainResponse])
def list_domains(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all domains. Available to all authenticated users.
    Used to populate the domain dropdown in complaint submission.
    """
    return get_all_domains(db)
@router.get("/{domain_id}", response_model=DomainResponse)
def get_domain(
    domain_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single domain by ID."""
    return get_domain_by_id(domain_id, db)
@router.post("", response_model=DomainResponse, status_code=201)
def add_domain(
    request: DomainCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Create a new domain. Admin only."""
    return create_domain(request, db)
@router.put("/{domain_id}", response_model=DomainResponse)
def edit_domain(
    domain_id: UUID,
    request: DomainUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Update a domain's name. Admin only."""
    return update_domain(domain_id, request, db)
@router.delete("/{domain_id}")
def remove_domain(
    domain_id: UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Delete a domain. Admin only."""
    return delete_domain(domain_id, db)
