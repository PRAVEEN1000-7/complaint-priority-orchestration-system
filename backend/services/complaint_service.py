from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException, status
from backend.models.complaint import Complaint
from backend.models.domain import Domain
from backend.models.domain_head import DomainHead
from backend.models.notification import Notification
from backend.models.user import User
from backend.schemas.complaint import (
    ComplaintCreate,
    ComplaintUpdate,
    ComplaintResponse,
    ComplaintDetailResponse,
    ComplaintSubmitResponse,
)
from backend.orchestrator.workflow import run_orchestrator
from backend.utils.logger import setup_logger

logger = setup_logger(__name__)
VALID_STATUSES = ["Submitted", "Under Review", "In Progress", "Resolved", "Closed"]


def _enrich_complaint(complaint: Complaint, db: Session) -> dict:
    domain_name = None
    domain_head_name = None
    if complaint.domain_id:
        domain = db.query(Domain).filter(Domain.id == complaint.domain_id).first()
        if domain:
            domain_name = domain.domain_name
    if complaint.assigned_domain_head:
        dh = (
            db.query(DomainHead)
            .filter(DomainHead.id == complaint.assigned_domain_head)
            .first()
        )
        if dh:
            user = db.query(User).filter(User.id == dh.user_id).first()
            if user:
                domain_head_name = user.name
    return {
        "id": complaint.id,
        "title": complaint.title,
        "description": complaint.description,
        "domain_id": complaint.domain_id,
        "domain_name": domain_name,
        "priority": complaint.priority,
        "status": complaint.status,
        "ai_reason": complaint.ai_reason,
        "assigned_domain_head": complaint.assigned_domain_head,
        "domain_head_name": domain_head_name,
        "remarks": complaint.remarks,
        "created_at": complaint.created_at,
        "updated_at": complaint.updated_at,
    }


def submit_complaint(
    request: ComplaintCreate, user_id: UUID, db: Session
) -> ComplaintSubmitResponse:
    domain = db.query(Domain).filter(Domain.id == request.domain_id).first()
    if not domain:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid domain",
        )
    complaint = Complaint(
        title=request.title,
        description=request.description,
        domain_id=request.domain_id,
        created_by=user_id,
        status="Submitted",
        priority="P4",
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    logger.info("Complaint created: ID %s by user %s", complaint.id, user_id)
    try:
        ai_result = run_orchestrator(
            title=request.title,
            description=request.description,
            user_selected_domain=domain.domain_name,
            db=db,
        )
        complaint.priority = ai_result.get("priority", "P3")
        complaint.ai_reason = ai_result.get("explanation", "")
        complaint.status = "Under Review"
        if ai_result.get("domain_id"):
            complaint.domain_id = ai_result["domain_id"]
        if ai_result.get("domain_head_id"):
            complaint.assigned_domain_head = ai_result["domain_head_id"]
            dh = (
                db.query(DomainHead)
                .filter(DomainHead.id == ai_result["domain_head_id"])
                .first()
            )
            if dh:
                notification = Notification(
                    complaint_id=complaint.id,
                    user_id=dh.user_id,
                    message=f"New {complaint.priority} complaint: {complaint.title}",
                )
                db.add(notification)
        db.commit()
        db.refresh(complaint)
        logger.info(
            "AI processing complete for complaint %s: Priority=%s, Domain Head=%s",
            complaint.id,
            complaint.priority,
            complaint.assigned_domain_head,
        )
    except Exception as e:
        logger.error(
            "AI orchestrator failed for complaint %s: %s", complaint.id, str(e)
        )
    domain = db.query(Domain).filter(Domain.id == complaint.domain_id).first()
    return ComplaintSubmitResponse(
        id=complaint.id,
        title=complaint.title,
        priority=complaint.priority,
        status=complaint.status,
        domain_name=domain.domain_name if domain else None,
        ai_reason=complaint.ai_reason,
        created_at=complaint.created_at,
    )


def get_complaints_for_user(user_id: UUID, db: Session) -> list[ComplaintResponse]:
    complaints = (
        db.query(Complaint)
        .filter(Complaint.created_by == user_id)
        .order_by(desc(Complaint.created_at))
        .all()
    )
    return [ComplaintResponse(**_enrich_complaint(c, db)) for c in complaints]


def get_complaints_for_domain_head(
    user_id: UUID, db: Session
) -> list[ComplaintResponse]:
    dh = db.query(DomainHead).filter(DomainHead.user_id == user_id).first()
    if not dh:
        return []
    priority_order = {"P1": 1, "P2": 2, "P3": 3, "P4": 4}
    complaints = (
        db.query(Complaint)
        .filter(Complaint.assigned_domain_head == dh.id)
        .order_by(Complaint.priority, desc(Complaint.created_at))
        .all()
    )
    complaints.sort(key=lambda c: priority_order.get(c.priority, 5))
    return [ComplaintResponse(**_enrich_complaint(c, db)) for c in complaints]


def get_all_complaints(db: Session) -> list[ComplaintResponse]:
    complaints = db.query(Complaint).order_by(desc(Complaint.created_at)).all()
    return [ComplaintResponse(**_enrich_complaint(c, db)) for c in complaints]


def get_complaint_detail(complaint_id: UUID, db: Session) -> ComplaintDetailResponse:
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )
    return ComplaintDetailResponse(**_enrich_complaint(complaint, db))


def update_complaint(
    complaint_id: UUID,
    request: ComplaintUpdate,
    user_id: UUID,
    db: Session,
) -> ComplaintDetailResponse:
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )
    if request.status is not None:
        if request.status not in VALID_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}",
            )
        complaint.status = request.status
    if request.remarks is not None:
        complaint.remarks = request.remarks
    db.commit()
    db.refresh(complaint)
    logger.info(
        "Complaint %s updated by user %s: status=%s",
        complaint_id,
        user_id,
        complaint.status,
    )
    return ComplaintDetailResponse(**_enrich_complaint(complaint, db))
