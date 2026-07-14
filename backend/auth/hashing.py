"""
Password hashing utilities using bcrypt directly.
bcrypt 5.x removed the __about__ module that passlib depends on,
so we use bcrypt directly for forward compatibility.
"""
import bcrypt
def hash_password(password: str) -> str:
    """
    Hash a plain-text password using bcrypt.
    Args:
        password: The plain-text password to hash.
    Returns:
        The bcrypt-hashed password string.
    """
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against a hashed password.
    Args:
        plain_password: The plain-text password to verify.
        hashed_password: The hashed password to compare against.
    Returns:
        True if the password matches, False otherwise.
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False
