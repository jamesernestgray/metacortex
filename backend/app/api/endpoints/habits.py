from typing import List, Optional, Dict, Any
from datetime import date, datetime, timedelta
from fastapi import APIRouter, HTTPException, status, Query
from uuid import UUID

from app.api.deps import CurrentUser, DbSession, Pagination, Sorting
from app.models.habit import Habit, HabitLog
from app.schemas.habit import (
    Habit as HabitSchema,
    HabitCreate,
    HabitUpdate,
    HabitWithLogs,
    HabitLog as HabitLogSchema,
    HabitLogCreate,
    HabitStats,
    HabitStreak,
)
from app.repositories.habit import HabitRepository, HabitLogRepository

router = APIRouter()


@router.post("/", response_model=HabitSchema, status_code=status.HTTP_201_CREATED)
async def create_habit(
    habit_in: HabitCreate,
    current_user: CurrentUser,
    db: DbSession
) -> Habit:
    """Create a new habit"""
    habit_repo = HabitRepository(Habit, db)
    
    habit_data = habit_in.model_dump()
    habit = await habit_repo.create_for_user(current_user.clerk_id, habit_data)
    
    return habit


@router.get("/", response_model=List[HabitSchema])
async def get_habits(
    current_user: CurrentUser,
    db: DbSession,
    pagination: Pagination,
    category: Optional[str] = None,
    active_only: bool = True,
) -> List[Habit]:
    """Get habits with filtering and pagination"""
    habit_repo = HabitRepository(Habit, db)
    
    # Get by category
    if category:
        return await habit_repo.get_by_category(
            current_user.clerk_id,
            category,
            skip=pagination.skip,
            limit=pagination.limit
        )
    
    # Get active habits
    if active_only:
        return await habit_repo.get_active_habits(
            current_user.clerk_id,
            skip=pagination.skip,
            limit=pagination.limit
        )
    
    # Get all habits
    return await habit_repo.get_multi_by_user(
        current_user.clerk_id,
        skip=pagination.skip,
        limit=pagination.limit
    )


@router.get("/today", response_model=List[Dict[str, Any]])
async def get_today_habits(
    current_user: CurrentUser,
    db: DbSession
) -> List[Dict[str, Any]]:
    """Get habits that should be done today with completion status"""
    habit_repo = HabitRepository(Habit, db)
    return await habit_repo.get_today_habits(current_user.clerk_id)


@router.get("/categories", response_model=List[str])
async def get_categories(
    current_user: CurrentUser,
    db: DbSession
) -> List[str]:
    """Get all unique habit categories"""
    habit_repo = HabitRepository(Habit, db)
    return await habit_repo.get_categories(current_user.clerk_id)


@router.get("/streaks", response_model=List[HabitStreak])
async def get_streaks(
    current_user: CurrentUser,
    db: DbSession
) -> List[Dict[str, Any]]:
    """Get current streaks for all active habits"""
    habit_repo = HabitRepository(Habit, db)
    return await habit_repo.get_streaks(current_user.clerk_id)


@router.get("/stats", response_model=HabitStats)
async def get_habit_stats(
    current_user: CurrentUser,
    db: DbSession
) -> Dict[str, Any]:
    """Get habit statistics for current user"""
    habit_repo = HabitRepository(Habit, db)
    return await habit_repo.get_stats(current_user.clerk_id)


@router.get("/{habit_id}", response_model=HabitWithLogs)
async def get_habit(
    habit_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
    days: int = Query(30, ge=1, le=365)
) -> Dict[str, Any]:
    """Get a specific habit with recent logs"""
    habit_repo = HabitRepository(Habit, db)
    result = await habit_repo.get_with_logs(current_user.clerk_id, habit_id, days)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    return result


@router.patch("/{habit_id}", response_model=HabitSchema)
async def update_habit(
    habit_id: UUID,
    habit_update: HabitUpdate,
    current_user: CurrentUser,
    db: DbSession
) -> Habit:
    """Update a habit"""
    habit_repo = HabitRepository(Habit, db)
    
    update_data = habit_update.model_dump(exclude_unset=True)
    habit = await habit_repo.update_for_user(
        current_user.clerk_id,
        habit_id,
        update_data
    )
    
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    return habit


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_habit(
    habit_id: UUID,
    current_user: CurrentUser,
    db: DbSession
) -> None:
    """Delete a habit (soft delete)"""
    habit_repo = HabitRepository(Habit, db)
    
    success = await habit_repo.delete_for_user(current_user.clerk_id, habit_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )


@router.post("/{habit_id}/archive", response_model=HabitSchema)
async def archive_habit(
    habit_id: UUID,
    current_user: CurrentUser,
    db: DbSession
) -> Habit:
    """Archive a habit"""
    habit_repo = HabitRepository(Habit, db)
    
    habit = await habit_repo.archive_habit(current_user.clerk_id, habit_id)
    
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    return habit


# Habit log endpoints
@router.post("/{habit_id}/logs", response_model=HabitLogSchema)
async def log_habit(
    habit_id: UUID,
    log_in: HabitLogCreate,
    current_user: CurrentUser,
    db: DbSession
) -> HabitLog:
    """Log a habit completion"""
    habit_repo = HabitRepository(Habit, db)
    
    log = await habit_repo.log_habit(
        current_user.clerk_id,
        habit_id,
        log_in.date,
        log_in.completed,
        log_in.value,
        log_in.notes
    )
    
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    return log


@router.get("/{habit_id}/logs", response_model=List[HabitLogSchema])
async def get_habit_logs(
    habit_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
    start_date: date = Query(..., description="Start date for logs"),
    end_date: date = Query(..., description="End date for logs"),
) -> List[HabitLog]:
    """Get habit logs for a date range"""
    habit_repo = HabitRepository(Habit, db)
    
    return await habit_repo.get_habit_logs(
        current_user.clerk_id,
        habit_id,
        start_date,
        end_date
    )


@router.get("/logs/range", response_model=List[HabitLogSchema])
async def get_user_logs(
    current_user: CurrentUser,
    db: DbSession,
    start_date: date = Query(..., description="Start date for logs"),
    end_date: date = Query(..., description="End date for logs"),
) -> List[HabitLog]:
    """Get all habit logs for user in a date range"""
    log_repo = HabitLogRepository(db)
    
    return await log_repo.get_user_logs(
        current_user.clerk_id,
        start_date,
        end_date
    )


@router.delete("/logs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_log(
    log_id: UUID,
    current_user: CurrentUser,
    db: DbSession
) -> None:
    """Delete a habit log"""
    log_repo = HabitLogRepository(db)
    
    success = await log_repo.delete_log(current_user.clerk_id, log_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Log not found"
        )