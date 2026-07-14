"""
Authentication API routes: register and login.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from backend.services.auth_service import register_user, login_user
router = APIRouter(prefix="/api", tags=["Authentication"])
@router.post("/register", response_model=UserResponse, status_code=201)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user account.
    - Validates password match
    - Checks email uniqueness
    - Creates user with role 'user'
    """
    return register_user(request, db)
@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate and receive a JWT access token.
    - Verifies email and password
    - Returns JWT token with user info
    """
    return login_user(request, db)
