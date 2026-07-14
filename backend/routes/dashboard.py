"""
Dashboard API route.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.auth.dependencies import get_current_user
from backend.models.user import User
from backend.services.dashboard_service import (
    get_user_dashboard,
    get_domain_head_dashboard,
)
router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])
@router.get("")
def dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get dashboard statistics based on the current user's role.
    - User: own complaint stats
    - Domain Head: assigned complaint stats
    - Admin: redirects to /api/admin/statistics
    """
    if current_user.role == "domain_head":
        return get_domain_head_dashboard(current_user.id, db)
    else:
        return get_user_dashboard(current_user.id, db)
