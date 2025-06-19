from typing import Optional, List, Dict, Any
from pydantic import EmailStr, Field
import uuid

from app.schemas.base import BaseSchema, IDSchema, TimestampSchema


class UserBase(BaseSchema):
    """Base user schema"""
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a user from Clerk webhook"""
    clerk_id: str
    is_verified: bool = False
    is_active: bool = True


class UserUpdate(BaseSchema):
    """Schema for updating user"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None
    enabled_modules: Optional[List[str]] = None


class UserInDB(UserBase, IDSchema, TimestampSchema):
    """User schema with all fields"""
    clerk_id: str
    is_active: bool
    is_verified: bool
    preferences: Dict[str, Any] = Field(default_factory=dict)
    enabled_modules: List[str] = Field(default_factory=list)
    full_name: str = Field(computed=True)
    
    @property
    def full_name(self) -> str:
        """Compute full name"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.first_name or self.last_name or self.username or self.email


class User(UserInDB):
    """User schema for API responses"""
    pass


class UserPublic(BaseSchema):
    """Public user information"""
    id: uuid.UUID
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None