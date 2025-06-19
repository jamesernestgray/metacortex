from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import Field, validator
import uuid

from app.schemas.base import UserOwnedSchema, BaseSchema
from app.models.habit import HabitFrequency


class HabitBase(BaseSchema):
    """Base habit schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    frequency: HabitFrequency = HabitFrequency.DAILY
    target_days: Optional[List[int]] = None
    target_value: Optional[float] = None
    unit: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = None
    reminder_time: Optional[str] = None
    
    @validator('target_days')
    def validate_target_days(cls, v, values):
        if v is None:
            return v
        
        frequency = values.get('frequency')
        if frequency == HabitFrequency.WEEKLY:
            # For weekly, target_days are weekdays (0-6)
            if not all(0 <= day <= 6 for day in v):
                raise ValueError("Weekly target days must be between 0-6")
        elif frequency == HabitFrequency.MONTHLY:
            # For monthly, target_days are days of month (1-31)
            if not all(1 <= day <= 31 for day in v):
                raise ValueError("Monthly target days must be between 1-31")
        
        return v


class HabitCreate(HabitBase):
    """Schema for creating a habit"""
    is_active: bool = True


class HabitUpdate(BaseSchema):
    """Schema for updating a habit"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    frequency: Optional[HabitFrequency] = None
    target_days: Optional[List[int]] = None
    target_value: Optional[float] = None
    unit: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = None
    reminder_time: Optional[str] = None
    is_active: Optional[bool] = None


class HabitInDB(HabitBase, UserOwnedSchema):
    """Habit schema with all fields"""
    is_active: bool = True
    is_archived: bool = False
    streak_count: int = 0
    best_streak: int = 0
    total_completions: int = 0
    last_completed: Optional[date] = None


class Habit(HabitInDB):
    """Habit schema for API responses"""
    pass


class HabitSummary(BaseSchema):
    """Summary habit information"""
    id: uuid.UUID
    name: str
    category: Optional[str] = None
    frequency: HabitFrequency
    color: Optional[str] = None
    icon: Optional[str] = None
    streak_count: int
    is_active: bool


# Habit Log Schemas
class HabitLogBase(BaseSchema):
    """Base habit log schema"""
    date: date
    completed: bool = True
    value: Optional[float] = None
    notes: Optional[str] = None


class HabitLogCreate(HabitLogBase):
    """Schema for creating a habit log"""
    pass


class HabitLogInDB(HabitLogBase):
    """Habit log schema with all fields"""
    id: uuid.UUID
    habit_id: uuid.UUID
    created_at: datetime


class HabitLog(HabitLogInDB):
    """Habit log schema for API responses"""
    pass


# Composite schemas
class HabitWithLogs(BaseSchema):
    """Habit with recent logs"""
    habit: Habit
    logs: List[HabitLog]
    streak: int


class HabitStreak(BaseSchema):
    """Habit streak information"""
    habit: HabitSummary
    current_streak: int
    best_streak: int


class HabitStats(BaseSchema):
    """Habit statistics"""
    total: int
    active: int
    archived: int
    completion_rate_today: float
    completed_today: int
    total_today: int
    monthly_logs: int