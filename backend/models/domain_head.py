import uuid
from sqlalchemy import Column, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from backend.database.connection import Base


class DomainHead(Base):
    __tablename__ = "domain_heads"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    domain_id = Column(
        UUID(as_uuid=True),
        ForeignKey("domains.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    __table_args__ = (UniqueConstraint("user_id", "domain_id"),)
    user = relationship("User", back_populates="domain_head_assignments")
    domain = relationship("Domain", back_populates="domain_heads")
    assigned_complaints = relationship("Complaint", back_populates="domain_head")

    def __repr__(self):
        return f"<DomainHead(id={self.id}, user_id={self.user_id}, domain_id={self.domain_id})>"
