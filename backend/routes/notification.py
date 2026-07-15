from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.auth.dependencies import get_current_user
from backend.models.user import User
from backend.schemas.notification import NotificationResponse
from backend.services.notification_service import (
    get_user_notifications,
    mark_notification_read,
    get_unread_count,
)

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("", response_model=list[NotificationResponse])
def list_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_notifications(current_user.id, db)


@router.put("/{notification_id}/read", response_model=NotificationResponse)
def read_notification(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return mark_notification_read(notification_id, current_user.id, db)


@router.get("/unread-count")
def unread_notification_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = get_unread_count(current_user.id, db)
    return {"unread_count": count}
