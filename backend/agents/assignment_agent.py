"""
Assignment Agent  Assigns complaint to the appropriate Domain Head.
Looks up the domain head for the detected/selected domain and returns
the assignment.
"""

from uuid import UUID
from sqlalchemy.orm import Session
from backend.models.domain import Domain
from backend.models.domain_head import DomainHead
from backend.utils.logger import setup_logger

logger = setup_logger(__name__)


def run_assignment_agent(domain_name: str, db: Session) -> dict | None:
    """
    Find the domain head assigned to the given domain.
    This agent does not use AI  it performs a database lookup
    to find the correct domain head.
    Args:
        domain_name: The domain name (from Category Agent).
        db: Database session.
    Returns:
        Dictionary with domain_id, domain_head_id, and user_id if found,
        None if no domain head is assigned.
    """
    logger.info("Assignment Agent: Looking up domain head for '%s'...", domain_name)
    domain = db.query(Domain).filter(Domain.domain_name == domain_name).first()
    if not domain:
        logger.warning("Assignment Agent: Domain '%s' not found.", domain_name)
        return None
    domain_head = db.query(DomainHead).filter(DomainHead.domain_id == domain.id).first()
    if not domain_head:
        logger.warning(
            "Assignment Agent: No domain head assigned for domain '%s'.", domain_name
        )
        return None
    logger.info(
        "Assignment Agent: Assigned to domain head ID %s (user ID %s)",
        domain_head.id,
        domain_head.user_id,
    )
    return {
        "domain_id": domain.id,
        "domain_head_id": domain_head.id,
        "user_id": domain_head.user_id,
    }
