"""
Complaint SQLAlchemy model.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from backend.database.connection import Base
class Complaint(Base):
    """Represents a user-submitted complaint processed by the AI system."""
    __tablename__ = "complaints"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    domain_id = Column(
        UUID(as_uuid=True),
        ForeignKey("domains.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    priority = Column(String(5), nullable=False, default="P4", index=True)
    status = Column(String(20), nullable=False, default="Submitted", index=True)
    ai_reason = Column(Text, nullable=True)
    assigned_domain_head = Column(
        UUID(as_uuid=True),
        ForeignKey("domain_heads.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    remarks = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    domain = relationship("Domain", back_populates="complaints")
    domain_head = relationship("DomainHead", back_populates="assigned_complaints")
    creator = relationship(
        "User", back_populates="complaints_created", foreign_keys=[created_by]
    )
    notifications = relationship(
        "Notification", back_populates="complaint", cascade="all, delete-orphan"
    )
    def __repr__(self):
        return f"<Complaint(id={self.id}, title={self.title}, priority={self.priority}, status={self.status})>"
