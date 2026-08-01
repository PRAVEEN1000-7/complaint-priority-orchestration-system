from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.models.domain import Domain
from backend.schemas.domain import DomainCreate, DomainUpdate, DomainResponse
from backend.utils.logger import setup_logger
from backend.models.complaint import Complaint
from backend.models.domain_head import DomainHead
from backend.models.notification import Notification
from backend.orchestrator.workflow import run_orchestrator

logger = setup_logger(__name__)


def create_domain(request: DomainCreate, db: Session) -> DomainResponse:
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
    
    # Trigger reassignment for active complaints (even assigned ones, as this new domain might be a better match)
    try:
        active_complaints = (
            db.query(Complaint)
            .filter(Complaint.status.in_(["Submitted", "Under Review"]))
            .all()
        )
        for complaint in active_complaints:
            ai_result = run_orchestrator(
                title=complaint.title,
                description=complaint.description,
                user_selected_domain=None,
                db=db,
            )
            # If the AI maps it to a domain now
            if ai_result.get("domain_id"):
                complaint.domain_id = ai_result["domain_id"]
                if ai_result.get("domain_head_id"):
                    complaint.assigned_domain_head = ai_result["domain_head_id"]
                    dh = db.query(DomainHead).filter(DomainHead.id == ai_result["domain_head_id"]).first()
                    if dh:
                        notification = Notification(
                            complaint_id=complaint.id,
                            user_id=dh.user_id,
                            message=f"New {complaint.priority} complaint reassigned to your domain: {complaint.title}",
                        )
                        db.add(notification)
        db.commit()
    except Exception as e:
        logger.error("Failed during AI reassignment on domain creation: %s", str(e))
        db.rollback()

    return DomainResponse.model_validate(domain)


def get_all_domains(db: Session) -> list[DomainResponse]:
    domains = db.query(Domain).order_by(Domain.domain_name).all()
    return [DomainResponse.model_validate(d) for d in domains]


def get_domain_by_id(domain_id: UUID, db: Session) -> DomainResponse:
    domain = db.query(Domain).filter(Domain.id == domain_id).first()
    if not domain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found"
        )
    return DomainResponse.model_validate(domain)


def update_domain(
    domain_id: UUID, request: DomainUpdate, db: Session
) -> DomainResponse:
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
    domain = db.query(Domain).filter(Domain.id == domain_id).first()
    if not domain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found"
        )
    db.delete(domain)
    db.commit()
    logger.info("Domain deleted: ID %s", domain_id)
    return {"message": "Domain deleted successfully"}
