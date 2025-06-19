from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import selectinload

from app.models.task import Task, Project, TaskStatus, TaskPriority
from app.repositories.base import UserOwnedRepository


class TaskRepository(UserOwnedRepository[Task]):
    """Repository for task operations"""
    
    async def get_multi_by_user(
        self,
        user_id: str,
        *,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[str] = None,
    ) -> List[Task]:
        """Get multiple tasks for a user with relations loaded"""
        query = select(Task).where(
            and_(
                Task.user_id == user_id,
                Task.is_deleted == False
            )
        ).options(
            selectinload(Task.subtasks),
            selectinload(Task.project)
        )
        
        # Apply filters
        if filters:
            for key, value in filters.items():
                if hasattr(Task, key) and value is not None:
                    query = query.where(getattr(Task, key) == value)
        
        # Apply ordering
        if order_by:
            if order_by.startswith("-"):
                query = query.order_by(getattr(Task, order_by[1:]).desc())
            else:
                query = query.order_by(getattr(Task, order_by))
        else:
            query = query.order_by(Task.created_at.desc())
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_with_relations(
        self,
        user_id: str,
        task_id: UUID
    ) -> Optional[Task]:
        """Get task with all relations loaded"""
        query = select(Task).where(
            and_(
                Task.id == task_id,
                Task.user_id == user_id,
                Task.is_deleted == False
            )
        ).options(
            selectinload(Task.subtasks),
            selectinload(Task.project),
            selectinload(Task.task_logs)
        )
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_by_status(
        self,
        user_id: str,
        status: TaskStatus,
        skip: int = 0,
        limit: int = 100
    ) -> List[Task]:
        """Get tasks by status"""
        return await self.get_multi_by_user(
            user_id,
            skip=skip,
            limit=limit,
            filters={"status": status}
        )
    
    async def get_overdue(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Task]:
        """Get overdue tasks"""
        query = select(Task).where(
            and_(
                Task.user_id == user_id,
                Task.is_deleted == False,
                Task.due_date < datetime.utcnow(),
                Task.status.not_in([TaskStatus.COMPLETED, TaskStatus.CANCELLED])
            )
        ).order_by(Task.due_date).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_by_project(
        self,
        user_id: str,
        project_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Task]:
        """Get tasks by project"""
        return await self.get_multi_by_user(
            user_id,
            skip=skip,
            limit=limit,
            filters={"project_id": project_id}
        )
    
    async def search(
        self,
        user_id: str,
        query: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Task]:
        """Search tasks by title or description"""
        search_query = select(Task).where(
            and_(
                Task.user_id == user_id,
                Task.is_deleted == False,
                or_(
                    Task.title.ilike(f"%{query}%"),
                    Task.description.ilike(f"%{query}%")
                )
            )
        ).order_by(Task.created_at.desc()).offset(skip).limit(limit)
        
        result = await self.db.execute(search_query)
        return result.scalars().all()
    
    async def get_subtasks(
        self,
        user_id: str,
        parent_task_id: UUID
    ) -> List[Task]:
        """Get all subtasks of a parent task"""
        query = select(Task).where(
            and_(
                Task.user_id == user_id,
                Task.parent_task_id == parent_task_id,
                Task.is_deleted == False
            )
        ).order_by(Task.created_at)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def complete_task(
        self,
        user_id: str,
        task_id: UUID
    ) -> Optional[Task]:
        """Mark task as completed"""
        task = await self.get_by_user(user_id, task_id)
        if not task:
            return None
        
        task.complete()
        await self.db.commit()
        await self.db.refresh(task)
        return task
    
    async def get_stats(
        self,
        user_id: str
    ) -> Dict[str, Any]:
        """Get task statistics for a user"""
        # Total tasks
        total_query = select(func.count(Task.id)).where(
            and_(
                Task.user_id == user_id,
                Task.is_deleted == False
            )
        )
        total_result = await self.db.execute(total_query)
        total = total_result.scalar() or 0
        
        # Tasks by status
        status_query = select(
            Task.status,
            func.count(Task.id)
        ).where(
            and_(
                Task.user_id == user_id,
                Task.is_deleted == False
            )
        ).group_by(Task.status)
        
        status_result = await self.db.execute(status_query)
        status_counts = {
            status.value: count 
            for status, count in status_result.all()
        }
        
        # Overdue tasks
        overdue_query = select(func.count(Task.id)).where(
            and_(
                Task.user_id == user_id,
                Task.is_deleted == False,
                Task.due_date < datetime.utcnow(),
                Task.status.not_in([TaskStatus.COMPLETED, TaskStatus.CANCELLED])
            )
        )
        overdue_result = await self.db.execute(overdue_query)
        overdue = overdue_result.scalar() or 0
        
        return {
            "total": total,
            "by_status": status_counts,
            "overdue": overdue
        }


class ProjectRepository(UserOwnedRepository[Project]):
    """Repository for project operations"""
    
    async def get_with_task_count(
        self,
        user_id: str,
        project_id: UUID
    ) -> Optional[Dict[str, Any]]:
        """Get project with task count"""
        project = await self.get_by_user(user_id, project_id)
        if not project:
            return None
        
        # Count tasks
        count_query = select(func.count(Task.id)).where(
            and_(
                Task.project_id == project_id,
                Task.user_id == user_id,
                Task.is_deleted == False
            )
        )
        count_result = await self.db.execute(count_query)
        task_count = count_result.scalar() or 0
        
        return {
            "project": project,
            "task_count": task_count
        }
    
    async def get_active_projects(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Project]:
        """Get active (non-archived) projects"""
        return await self.get_multi_by_user(
            user_id,
            skip=skip,
            limit=limit,
            filters={"is_active": True, "is_archived": False}
        )