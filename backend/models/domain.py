import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from backend.database.connection import Base


class Domain(Base):
    __tablename__ = "domains"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    domain_name = Column(String(100), nullable=False, unique=True, index=True)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    domain_heads = relationship(
        "DomainHead", back_populates="domain", cascade="all, delete-orphan"
    )
    complaints = relationship("Complaint", back_populates="domain")

    def __repr__(self):
        return f"<Domain(id={self.id}, name={self.domain_name})>"
