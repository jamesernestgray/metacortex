from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import Field, validator, computed_field
import uuid

from app.schemas.base import UserOwnedSchema, BaseSchema
from app.models.task import TaskStatus, TaskPriority


class TaskBase(BaseSchema):
    """Base task schema"""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.PENDING
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None
    tags: List[str] = Field(default_factory=list)
    meta_data: Dict[str, Any] = Field(default_factory=dict)


class TaskCreate(TaskBase):
    """Schema for creating a task"""
    parent_task_id: Optional[uuid.UUID] = None
    project_id: Optional[uuid.UUID] = None
    assignee_id: Optional[str] = None
    is_recurring: bool = False
    recurrence_rule: Optional[str] = None


class TaskUpdate(BaseSchema):
    """Schema for updating a task"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    tags: Optional[List[str]] = None
    meta_data: Optional[Dict[str, Any]] = None
    parent_task_id: Optional[uuid.UUID] = None
    project_id: Optional[uuid.UUID] = None
    assignee_id: Optional[str] = None


class TaskInDB(TaskBase, UserOwnedSchema):
    """Task schema with all fields"""
    completed_at: Optional[datetime] = None
    parent_task_id: Optional[uuid.UUID] = None
    project_id: Optional[uuid.UUID] = None
    assignee_id: Optional[str] = None
    delegated_to: Optional[str] = None
    delegated_at: Optional[datetime] = None
    is_recurring: bool = False
    recurrence_rule: Optional[str] = None
    recurrence_parent_id: Optional[uuid.UUID] = None
    @computed_field  # type: ignore[misc]
    @property
    def is_overdue(self) -> bool:
        """Check if task is overdue"""
        if self.due_date and self.status not in [TaskStatus.COMPLETED, TaskStatus.CANCELLED]:
            return datetime.utcnow() > self.due_date
        return False


class Task(TaskInDB):
    """Task schema for API responses"""
    subtasks: Optional[List["Task"]] = Field(default=None)
    project: Optional["ProjectSummary"] = None
    
    @validator('subtasks', pre=True, always=True)
    def ensure_subtasks_list(cls, v):
        return v if v is not None else []


class TaskSummary(BaseSchema):
    """Summary task information"""
    id: uuid.UUID
    title: str
    status: TaskStatus
    priority: TaskPriority
    due_date: Optional[datetime] = None
    is_overdue: bool = False


# Project Schemas
class ProjectBase(BaseSchema):
    """Base project schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = None


class ProjectCreate(ProjectBase):
    """Schema for creating a project"""
    pass


class ProjectUpdate(BaseSchema):
    """Schema for updating a project"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = None
    is_active: Optional[bool] = None
    is_archived: Optional[bool] = None


class ProjectInDB(ProjectBase, UserOwnedSchema):
    """Project schema with all fields"""
    is_active: bool = True
    is_archived: bool = False


class Project(ProjectInDB):
    """Project schema for API responses"""
    task_count: int = 0


class ProjectSummary(BaseSchema):
    """Summary project information"""
    id: uuid.UUID
    name: str
    color: Optional[str] = None
    icon: Optional[str] = None


# Fix forward references
Task.model_rebuild()


# Filter schemas for list endpoints
class TaskFilter(BaseSchema):
    """Schema for filtering tasks"""
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    project_id: Optional[uuid.UUID] = None
    assignee_id: Optional[str] = None
    tags: Optional[List[str]] = None
    is_overdue: Optional[bool] = None
    search: Optional[str] = None