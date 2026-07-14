"""
User SQLAlchemy model.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from backend.database.connection import Base
class User(Base):
    """Represents an application user (user, domain_head, or admin)."""
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String(20), nullable=False, default="user", index=True)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    domain_head_assignments = relationship(
        "DomainHead", back_populates="user", cascade="all, delete-orphan"
    )
    complaints_created = relationship(
        "Complaint", back_populates="creator", foreign_keys="Complaint.created_by"
    )
    notifications = relationship(
        "Notification", back_populates="user", cascade="all, delete-orphan"
    )
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
