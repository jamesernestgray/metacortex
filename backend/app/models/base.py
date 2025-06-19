from datetime import datetime
from typing import Optional
import uuid
from sqlalchemy import Column, String, DateTime, Boolean, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property

from app.core.database import Base, TimestampMixin


class BaseModel(Base, TimestampMixin):
    """Base model with common fields for all database models"""
    __abstract__ = True
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Soft delete fields
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    @hybrid_property
    def is_active(self) -> bool:
        """Check if the record is active (not soft deleted)"""
        return not self.is_deleted
    
    def soft_delete(self) -> None:
        """Soft delete the record"""
        self.is_deleted = True
        self.deleted_at = datetime.utcnow()
    
    def restore(self) -> None:
        """Restore a soft deleted record"""
        self.is_deleted = False
        self.deleted_at = None


class UserOwnedModel(BaseModel):
    """Base model for resources owned by a user"""
    __abstract__ = True
    
    # User ID will be populated from Clerk
    user_id = Column(String, nullable=False, index=True)