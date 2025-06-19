from datetime import datetime
from typing import Optional
from enum import Enum
from sqlalchemy import Column, String, Text, DateTime, Boolean, Integer, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import UserOwnedModel, BaseModel


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"
    CANCELLED = "cancelled"


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Task(UserOwnedModel):
    """Task model for the task management system"""
    __tablename__ = "tasks"
    
    # Basic fields
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Status and priority
    status = Column(SQLEnum(TaskStatus), default=TaskStatus.PENDING, nullable=False, index=True)
    priority = Column(SQLEnum(TaskPriority), default=TaskPriority.MEDIUM, nullable=False, index=True)
    
    # Dates
    due_date = Column(DateTime(timezone=True), nullable=True, index=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Parent-child relationship for subtasks
    parent_task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=True)
    
    # Project relationship
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=True)
    
    # Assignment and delegation
    assignee_id = Column(String, nullable=True)  # Can be another user's clerk_id
    delegated_to = Column(String, nullable=True)  # Can be "ai_agent" or user ID
    delegated_at = Column(DateTime(timezone=True), nullable=True)
    
    # Recurring task fields
    is_recurring = Column(Boolean, default=False, nullable=False)
    recurrence_rule = Column(String, nullable=True)  # RRULE format
    recurrence_parent_id = Column(UUID(as_uuid=True), nullable=True)
    
    # Additional metadata
    tags = Column(JSON, default=list, nullable=False)
    meta_data = Column(JSON, default=dict, nullable=False)
    
    # Relationships
    # user = relationship("User", back_populates="tasks")  # Removed - no foreign key to User model
    project = relationship("Project", back_populates="tasks")
    subtasks = relationship("Task", backref="parent", remote_side="Task.id")
    task_logs = relationship("TaskLog", back_populates="task", cascade="all, delete-orphan")
    
    def complete(self) -> None:
        """Toggle task completion status"""
        if self.status == TaskStatus.COMPLETED:
            self.status = TaskStatus.PENDING
            self.completed_at = None
        else:
            self.status = TaskStatus.COMPLETED
            self.completed_at = datetime.utcnow()
    
    def is_overdue(self) -> bool:
        """Check if task is overdue"""
        if self.due_date and self.status not in [TaskStatus.COMPLETED, TaskStatus.CANCELLED]:
            return datetime.utcnow() > self.due_date
        return False
    
    def can_edit(self, user_id: str) -> bool:
        """Check if user can edit this task"""
        return self.user_id == user_id or self.assignee_id == user_id


class Project(UserOwnedModel):
    """Project model to group tasks"""
    __tablename__ = "projects"
    
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String(7), nullable=True)  # Hex color
    icon = Column(String(50), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_archived = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    tasks = relationship("Task", back_populates="project")


class TaskLog(BaseModel):
    """Activity log for tasks"""
    __tablename__ = "task_logs"
    
    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=False)
    user_id = Column(String, nullable=False)
    action = Column(String(50), nullable=False)  # created, updated, completed, etc.
    changes = Column(JSON, nullable=True)
    
    # Relationship
    task = relationship("Task", back_populates="task_logs")