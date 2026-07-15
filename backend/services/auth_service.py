from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.models.user import User
from backend.auth.hashing import hash_password, verify_password
from backend.auth.jwt_handler import create_access_token
from backend.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
)
from backend.utils.logger import setup_logger

logger = setup_logger(__name__)


def register_user(request: RegisterRequest, db: Session) -> UserResponse:
    if request.password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match",
        )
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    new_user = User(
        name=request.name,
        email=request.email,
        password_hash=hash_password(request.password),
        role="user",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    logger.info("User registered: %s (ID: %s)", new_user.email, new_user.id)
    return UserResponse.model_validate(new_user)


def login_user(request: LoginRequest, db: Session) -> TokenResponse:
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role,
            "name": user.name,
        }
    )
    logger.info("User logged in: %s (role: %s)", user.email, user.role)
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )
