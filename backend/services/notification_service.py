from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException, status
from backend.models.notification import Notification
from backend.models.complaint import Complaint
from backend.schemas.notification import NotificationResponse
from backend.utils.logger import setup_logger

logger = setup_logger(__name__)


def get_user_notifications(user_id: UUID, db: Session) -> list[NotificationResponse]:
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(desc(Notification.created_at))
        .all()
    )
    priority_order = {"P1": 1, "P2": 2, "P3": 3, "P4": 4}
    enriched = []
    for n in notifications:
        complaint = db.query(Complaint).filter(Complaint.id == n.complaint_id).first()
        enriched.append(
            NotificationResponse(
                id=n.id,
                complaint_id=n.complaint_id,
                complaint_title=complaint.title if complaint else None,
                complaint_priority=complaint.priority if complaint else None,
                message=n.message,
                read_status=n.read_status,
                created_at=n.created_at,
            )
        )
    enriched.sort(
        key=lambda x: (
            priority_order.get(x.complaint_priority, 5),
            -(x.created_at.timestamp() if x.created_at else 0),
        )
    )
    return enriched


def mark_notification_read(
    notification_id: UUID, user_id: UUID, db: Session
) -> NotificationResponse:
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == user_id)
        .first()
    )
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    notification.read_status = True
    db.commit()
    db.refresh(notification)
    complaint = (
        db.query(Complaint).filter(Complaint.id == notification.complaint_id).first()
    )
    return NotificationResponse(
        id=notification.id,
        complaint_id=notification.complaint_id,
        complaint_title=complaint.title if complaint else None,
        complaint_priority=complaint.priority if complaint else None,
        message=notification.message,
        read_status=notification.read_status,
        created_at=notification.created_at,
    )


def get_unread_count(user_id: UUID, db: Session) -> int:
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id, Notification.read_status == False)
        .count()
    )
