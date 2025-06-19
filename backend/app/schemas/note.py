from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import Field
import uuid

from app.schemas.base import UserOwnedSchema, BaseSchema


class NoteBase(BaseSchema):
    """Base note schema"""
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(default="")
    folder_path: Optional[str] = Field(None, max_length=500)
    tags: List[str] = Field(default_factory=list)
    meta_data: Dict[str, Any] = Field(default_factory=dict)
    is_favorite: bool = False


class NoteCreate(NoteBase):
    """Schema for creating a note"""
    pass


class NoteUpdate(BaseSchema):
    """Schema for updating a note"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = None
    folder_path: Optional[str] = Field(None, max_length=500)
    tags: Optional[List[str]] = None
    meta_data: Optional[Dict[str, Any]] = None
    is_favorite: Optional[bool] = None


class NoteInDB(NoteBase, UserOwnedSchema):
    """Note schema with all fields"""
    pass


class Note(NoteInDB):
    """Note schema for API responses"""
    pass


class NoteSummary(BaseSchema):
    """Summary note information"""
    id: uuid.UUID
    title: str
    folder_path: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    is_favorite: bool
    created_at: datetime
    updated_at: datetime


class NoteLink(BaseSchema):
    """Schema for note links"""
    target_id: uuid.UUID


class NoteWithLinks(Note):
    """Note with linked notes"""
    linked_to: List[NoteSummary] = Field(default_factory=list)
    linked_from: List[NoteSummary] = Field(default_factory=list)