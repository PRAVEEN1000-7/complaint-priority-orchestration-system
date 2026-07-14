"""
JWT token creation and verification.
"""
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from backend.database.config import settings
from backend.utils.logger import setup_logger
logger = setup_logger(__name__)
def create_access_token(data: dict) -> str:
    """
    Create a JWT access token.
    Args:
        data: Dictionary containing claims to encode (must include 'sub' for user ID).
    Returns:
        Encoded JWT string.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt
def verify_access_token(token: str) -> dict | None:
    """
    Verify and decode a JWT access token.
    Args:
        token: The JWT token string.
    Returns:
        Decoded payload dictionary if valid, None if invalid.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError as e:
        logger.warning("JWT verification failed: %s", str(e))
        return None
