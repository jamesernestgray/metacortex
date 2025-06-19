from datetime import datetime, date
from typing import Optional, List
from enum import Enum
from sqlalchemy import Column, String, Integer, Boolean, Date, Time, JSON, ForeignKey, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import UserOwnedModel, BaseModel


class HabitFrequency(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    CUSTOM = "custom"


class HabitType(str, Enum):
    BUILD = "build"  # Build a new habit
    BREAK = "break"  # Break a bad habit
    MAINTAIN = "maintain"  # Maintain an existing habit


class Habit(UserOwnedModel):
    """Habit model for tracking daily habits"""
    __tablename__ = "habits"
    
    # Basic fields
    name = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
    
    # Habit configuration
    habit_type = Column(SQLEnum(HabitType), default=HabitType.BUILD, nullable=False)
    frequency = Column(SQLEnum(HabitFrequency), default=HabitFrequency.DAILY, nullable=False)
    
    # Target and goal
    target_count = Column(Integer, default=1, nullable=False)  # Times per period
    target_days = Column(JSON, nullable=True)  # For weekly: [1,3,5] = Mon, Wed, Fri
    
    # Time preferences
    preferred_time = Column(Time, nullable=True)
    reminder_enabled = Column(Boolean, default=True, nullable=False)
    reminder_time = Column(Time, nullable=True)
    
    # Appearance
    icon = Column(String(50), nullable=True)
    color = Column(String(7), nullable=True)  # Hex color
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_archived = Column(Boolean, default=False, nullable=False)
    
    # Dates
    start_date = Column(Date, default=date.today, nullable=False)
    end_date = Column(Date, nullable=True)  # For time-bound habits
    
    # Relationships
    # user = relationship("User", back_populates="habits")  # Removed - no foreign key to User model
    logs = relationship("HabitLog", back_populates="habit", cascade="all, delete-orphan")
    streaks = relationship("HabitStreak", back_populates="habit", cascade="all, delete-orphan")
    
    def get_current_streak(self) -> Optional["HabitStreak"]:
        """Get the current active streak"""
        active_streaks = [s for s in self.streaks if s.is_active]
        return active_streaks[0] if active_streaks else None
    
    def check_in(self, check_in_date: date = None, notes: str = None) -> "HabitLog":
        """Record a habit check-in"""
        if check_in_date is None:
            check_in_date = date.today()
        
        # Check if already logged today
        existing_log = next(
            (log for log in self.logs if log.log_date == check_in_date),
            None
        )
        
        if existing_log:
            existing_log.completed = True
            existing_log.notes = notes
            return existing_log
        
        # Create new log
        log = HabitLog(
            habit_id=self.id,
            user_id=self.user_id,
            log_date=check_in_date,
            completed=True,
            notes=notes
        )
        self.logs.append(log)
        
        # Update streak
        self._update_streak(check_in_date)
        
        return log
    
    def _update_streak(self, check_in_date: date) -> None:
        """Update habit streak based on check-in"""
        current_streak = self.get_current_streak()
        
        if not current_streak:
            # Start new streak
            streak = HabitStreak(
                habit_id=self.id,
                user_id=self.user_id,
                start_date=check_in_date,
                current_count=1
            )
            self.streaks.append(streak)
        else:
            # Update existing streak
            current_streak.update(check_in_date)


class HabitLog(BaseModel):
    """Log of habit completions"""
    __tablename__ = "habit_logs"
    
    habit_id = Column(UUID(as_uuid=True), ForeignKey("habits.id"), nullable=False)
    user_id = Column(String, nullable=False)
    log_date = Column(Date, nullable=False, index=True)
    completed = Column(Boolean, default=False, nullable=False)
    completion_count = Column(Integer, default=0, nullable=False)  # For habits with multiple daily targets
    notes = Column(String(500), nullable=True)
    
    # Relationships
    habit = relationship("Habit", back_populates="logs")
    
    # Unique constraint on habit_id and log_date
    __table_args__ = (
        UniqueConstraint("habit_id", "log_date", name="uq_habit_log_date"),
    )


class HabitStreak(BaseModel):
    """Track habit streaks"""
    __tablename__ = "habit_streaks"
    
    habit_id = Column(UUID(as_uuid=True), ForeignKey("habits.id"), nullable=False)
    user_id = Column(String, nullable=False)
    
    # Streak data
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    current_count = Column(Integer, default=0, nullable=False)
    longest_count = Column(Integer, default=0, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    last_check_in = Column(Date, nullable=True)
    
    # Freeze/skip days
    freeze_count = Column(Integer, default=0, nullable=False)
    max_freezes = Column(Integer, default=2, nullable=False)
    
    # Relationships
    habit = relationship("Habit", back_populates="streaks")
    
    def update(self, check_in_date: date) -> None:
        """Update streak based on check-in date"""
        if self.last_check_in:
            days_diff = (check_in_date - self.last_check_in).days
            
            if days_diff == 1:
                # Consecutive day
                self.current_count += 1
            elif days_diff > 1:
                # Streak broken
                self.is_active = False
                self.end_date = self.last_check_in
                return
        
        self.last_check_in = check_in_date
        
        # Update longest streak
        if self.current_count > self.longest_count:
            self.longest_count = self.current_count