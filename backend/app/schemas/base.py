from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
import uuid


class BaseSchema(BaseModel):
    """Base schema with common configuration"""
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
    )


class TimestampSchema(BaseSchema):
    """Schema with timestamp fields"""
    created_at: datetime
    updated_at: datetime


class IDSchema(BaseSchema):
    """Schema with ID field"""
    id: uuid.UUID


class UserOwnedSchema(IDSchema, TimestampSchema):
    """Schema for user-owned resources"""
    user_id: str
    is_deleted: bool = False
    deleted_at: Optional[datetime] = None