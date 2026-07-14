"""
Business logic for dashboard statistics.
"""
from uuid import UUID
from sqlalchemy.orm import Session
from backend.models.complaint import Complaint
from backend.models.domain_head import DomainHead
from backend.utils.logger import setup_logger
logger = setup_logger(__name__)
def get_user_dashboard(user_id: UUID, db: Session) -> dict:
    """
    Get dashboard statistics for a regular user.
    Args:
        user_id: The user's ID.
        db: Database session.
    Returns:
        Dictionary with total, pending, and resolved complaint counts,
        plus a list of recent complaints.
    """
    total = db.query(Complaint).filter(Complaint.created_by == user_id).count()
    resolved = (
        db.query(Complaint)
        .filter(
            Complaint.created_by == user_id,
            Complaint.status.in_(["Resolved", "Closed"]),
        )
        .count()
    )
    pending = (
        db.query(Complaint)
        .filter(
            Complaint.created_by == user_id,
            Complaint.status.in_(["Submitted", "Under Review", "In Progress"]),
        )
        .count()
    )
    recent = (
        db.query(Complaint)
        .filter(Complaint.created_by == user_id)
        .order_by(Complaint.created_at.desc())
        .limit(5)
        .all()
    )
    recent_list = [
        {
            "id": str(c.id),
            "title": c.title,
            "priority": c.priority,
            "status": c.status,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in recent
    ]
    return {
        "total_complaints": total,
        "resolved_complaints": resolved,
        "pending_complaints": pending,
        "recent_complaints": recent_list,
    }
def get_domain_head_dashboard(user_id: UUID, db: Session) -> dict:
    """
    Get dashboard statistics for a domain head.
    Args:
        user_id: The domain head user's ID.
        db: Database session.
    Returns:
        Dictionary with assigned, pending, resolved, and critical counts.
    """
    dh = db.query(DomainHead).filter(DomainHead.user_id == user_id).first()
    if not dh:
        return {
            "assigned_complaints": 0,
            "pending_complaints": 0,
            "resolved_complaints": 0,
            "critical_complaints": 0,
            "recent_complaints": [],
        }
    assigned = (
        db.query(Complaint).filter(Complaint.assigned_domain_head == dh.id).count()
    )
    resolved = (
        db.query(Complaint)
        .filter(
            Complaint.assigned_domain_head == dh.id,
            Complaint.status.in_(["Resolved", "Closed"]),
        )
        .count()
    )
    pending = (
        db.query(Complaint)
        .filter(
            Complaint.assigned_domain_head == dh.id,
            Complaint.status.in_(["Submitted", "Under Review", "In Progress"]),
        )
        .count()
    )
    critical = (
        db.query(Complaint)
        .filter(
            Complaint.assigned_domain_head == dh.id,
            Complaint.priority.in_(["P1", "P2"]),
        )
        .count()
    )
    recent = (
        db.query(Complaint)
        .filter(Complaint.assigned_domain_head == dh.id)
        .order_by(Complaint.priority, Complaint.created_at.desc())
        .limit(5)
        .all()
    )
    recent_list = [
        {
            "id": str(c.id),
            "title": c.title,
            "priority": c.priority,
            "status": c.status,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in recent
    ]
    return {
        "assigned_complaints": assigned,
        "pending_complaints": pending,
        "resolved_complaints": resolved,
        "critical_complaints": critical,
        "recent_complaints": recent_list,
    }
