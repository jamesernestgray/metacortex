from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, date, timedelta
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.habit import Habit, HabitLog, HabitFrequency
from app.repositories.base import UserOwnedRepository


class HabitRepository(UserOwnedRepository[Habit]):
    """Repository for habit operations"""
    
    async def get_with_logs(
        self,
        user_id: str,
        habit_id: UUID,
        days: int = 30
    ) -> Optional[Dict[str, Any]]:
        """Get habit with recent logs"""
        habit = await self.get_by_user(user_id, habit_id)
        if not habit:
            return None
        
        # Get logs for the specified number of days
        start_date = datetime.utcnow().date() - timedelta(days=days)
        logs_query = select(HabitLog).where(
            and_(
                HabitLog.habit_id == habit_id,
                HabitLog.date >= start_date
            )
        ).order_by(HabitLog.date.desc())
        
        logs_result = await self.db.execute(logs_query)
        logs = logs_result.scalars().all()
        
        return {
            "habit": habit,
            "logs": logs,
            "streak": habit.calculate_streak(logs)
        }
    
    async def get_active_habits(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Habit]:
        """Get active (non-archived) habits"""
        return await self.get_multi_by_user(
            user_id,
            skip=skip,
            limit=limit,
            filters={"is_active": True, "is_archived": False}
        )
    
    async def get_by_category(
        self,
        user_id: str,
        category: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Habit]:
        """Get habits by category"""
        return await self.get_multi_by_user(
            user_id,
            skip=skip,
            limit=limit,
            filters={"category": category}
        )
    
    async def get_today_habits(
        self,
        user_id: str
    ) -> List[Dict[str, Any]]:
        """Get habits that should be done today with their completion status"""
        habits = await self.get_active_habits(user_id)
        today = datetime.utcnow().date()
        result = []
        
        for habit in habits:
            # Check if habit should be done today based on frequency
            should_do_today = self._should_do_today(habit, today)
            if not should_do_today:
                continue
            
            # Check if already logged today
            log_query = select(HabitLog).where(
                and_(
                    HabitLog.habit_id == habit.id,
                    HabitLog.date == today
                )
            )
            log_result = await self.db.execute(log_query)
            log = log_result.scalar_one_or_none()
            
            result.append({
                "habit": habit,
                "completed": log is not None,
                "log": log
            })
        
        return result
    
    def _should_do_today(self, habit: Habit, today: date) -> bool:
        """Check if habit should be done on a specific date"""
        if habit.frequency == HabitFrequency.DAILY:
            return True
        
        if habit.frequency == HabitFrequency.WEEKLY:
            # Check if today is one of the target days
            return today.weekday() in (habit.target_days or [])
        
        if habit.frequency == HabitFrequency.MONTHLY:
            # Check if today is the target day of month
            return today.day in (habit.target_days or [])
        
        # Custom frequency - always show
        return True
    
    async def log_habit(
        self,
        user_id: str,
        habit_id: UUID,
        date: date,
        completed: bool = True,
        value: Optional[float] = None,
        notes: Optional[str] = None
    ) -> Optional[HabitLog]:
        """Log a habit completion"""
        # Verify habit belongs to user
        habit = await self.get_by_user(user_id, habit_id)
        if not habit:
            return None
        
        # Check if already logged for this date
        existing_query = select(HabitLog).where(
            and_(
                HabitLog.habit_id == habit_id,
                HabitLog.date == date
            )
        )
        existing_result = await self.db.execute(existing_query)
        existing_log = existing_result.scalar_one_or_none()
        
        if existing_log:
            # Update existing log
            existing_log.completed = completed
            existing_log.value = value
            existing_log.notes = notes
            await self.db.commit()
            await self.db.refresh(existing_log)
            return existing_log
        else:
            # Create new log
            log = HabitLog(
                habit_id=habit_id,
                date=date,
                completed=completed,
                value=value,
                notes=notes
            )
            self.db.add(log)
            await self.db.commit()
            await self.db.refresh(log)
            return log
    
    async def get_habit_logs(
        self,
        user_id: str,
        habit_id: UUID,
        start_date: date,
        end_date: date
    ) -> List[HabitLog]:
        """Get habit logs for a date range"""
        # Verify habit belongs to user
        habit = await self.get_by_user(user_id, habit_id)
        if not habit:
            return []
        
        query = select(HabitLog).where(
            and_(
                HabitLog.habit_id == habit_id,
                HabitLog.date >= start_date,
                HabitLog.date <= end_date
            )
        ).order_by(HabitLog.date)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_streaks(
        self,
        user_id: str
    ) -> List[Dict[str, Any]]:
        """Get current streaks for all active habits"""
        habits = await self.get_active_habits(user_id)
        streaks = []
        
        for habit in habits:
            # Get recent logs
            logs_query = select(HabitLog).where(
                and_(
                    HabitLog.habit_id == habit.id,
                    HabitLog.completed == True
                )
            ).order_by(HabitLog.date.desc()).limit(365)
            
            logs_result = await self.db.execute(logs_query)
            logs = logs_result.scalars().all()
            
            current_streak = habit.calculate_streak(logs)
            
            streaks.append({
                "habit": habit,
                "current_streak": current_streak,
                "best_streak": habit.best_streak
            })
        
        return sorted(streaks, key=lambda x: x["current_streak"], reverse=True)
    
    async def archive_habit(
        self,
        user_id: str,
        habit_id: UUID
    ) -> Optional[Habit]:
        """Archive a habit"""
        habit = await self.get_by_user(user_id, habit_id)
        if not habit:
            return None
        
        habit.archive()
        await self.db.commit()
        await self.db.refresh(habit)
        return habit
    
    async def get_categories(
        self,
        user_id: str
    ) -> List[str]:
        """Get all unique categories for a user"""
        query = select(Habit.category).where(
            and_(
                Habit.user_id == user_id,
                Habit.is_deleted == False,
                Habit.category != None
            )
        ).distinct()
        
        result = await self.db.execute(query)
        return [cat for (cat,) in result.all()]
    
    async def get_stats(
        self,
        user_id: str
    ) -> Dict[str, Any]:
        """Get habit statistics for a user"""
        # Total habits
        total_query = select(func.count(Habit.id)).where(
            and_(
                Habit.user_id == user_id,
                Habit.is_deleted == False
            )
        )
        total_result = await self.db.execute(total_query)
        total = total_result.scalar() or 0
        
        # Active habits
        active_query = select(func.count(Habit.id)).where(
            and_(
                Habit.user_id == user_id,
                Habit.is_deleted == False,
                Habit.is_active == True,
                Habit.is_archived == False
            )
        )
        active_result = await self.db.execute(active_query)
        active = active_result.scalar() or 0
        
        # Get today's completion rate
        today_habits = await self.get_today_habits(user_id)
        completed_today = sum(1 for h in today_habits if h["completed"])
        completion_rate = (
            (completed_today / len(today_habits) * 100) 
            if today_habits else 0
        )
        
        # Get total logs this month
        month_start = datetime.utcnow().replace(day=1).date()
        logs_query = select(func.count(HabitLog.id)).where(
            and_(
                HabitLog.habit_id.in_(
                    select(Habit.id).where(
                        and_(
                            Habit.user_id == user_id,
                            Habit.is_deleted == False
                        )
                    )
                ),
                HabitLog.date >= month_start,
                HabitLog.completed == True
            )
        )
        logs_result = await self.db.execute(logs_query)
        monthly_logs = logs_result.scalar() or 0
        
        return {
            "total": total,
            "active": active,
            "archived": total - active,
            "completion_rate_today": round(completion_rate, 1),
            "completed_today": completed_today,
            "total_today": len(today_habits),
            "monthly_logs": monthly_logs
        }


class HabitLogRepository:
    """Repository for habit log operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_user_logs(
        self,
        user_id: str,
        start_date: date,
        end_date: date
    ) -> List[HabitLog]:
        """Get all habit logs for a user in a date range"""
        query = select(HabitLog).join(Habit).where(
            and_(
                Habit.user_id == user_id,
                HabitLog.date >= start_date,
                HabitLog.date <= end_date
            )
        ).order_by(HabitLog.date.desc(), HabitLog.created_at.desc())
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def delete_log(
        self,
        user_id: str,
        log_id: UUID
    ) -> bool:
        """Delete a habit log"""
        # Verify log belongs to user's habit
        query = select(HabitLog).join(Habit).where(
            and_(
                HabitLog.id == log_id,
                Habit.user_id == user_id
            )
        )
        result = await self.db.execute(query)
        log = result.scalar_one_or_none()
        
        if log:
            await self.db.delete(log)
            await self.db.commit()
            return True
        
        return False