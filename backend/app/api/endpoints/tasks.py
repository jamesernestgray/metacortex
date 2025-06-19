from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status, Query
from uuid import UUID

from app.api.deps import CurrentUser, DbSession, Pagination, Sorting
from app.models.task import Task, Project, TaskStatus, TaskPriority
from app.schemas.task import (
    Task as TaskSchema,
    TaskCreate,
    TaskUpdate,
    TaskFilter,
    Project as ProjectSchema,
    ProjectCreate,
    ProjectUpdate,
)
from app.repositories.task import TaskRepository, ProjectRepository

router = APIRouter()


# Task endpoints
@router.post("/", response_model=TaskSchema, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_in: TaskCreate,
    current_user: CurrentUser,
    db: DbSession
) -> Task:
    """Create a new task"""
    task_repo = TaskRepository(Task, db)
    
    # Convert to dict and add user_id
    task_data = task_in.model_dump()
    
    # Create task
    task = await task_repo.create_for_user(current_user.clerk_id, task_data)
    
    # Load relations
    return await task_repo.get_with_relations(current_user.clerk_id, task.id)


@router.get("/", response_model=List[TaskSchema])
async def get_tasks(
    current_user: CurrentUser,
    db: DbSession,
    pagination: Pagination,
    sorting: Sorting,
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    project_id: Optional[UUID] = None,
    assignee_id: Optional[str] = None,
    is_overdue: Optional[bool] = None,
    search: Optional[str] = None,
) -> List[Task]:
    """Get tasks with filtering and pagination"""
    task_repo = TaskRepository(Task, db)
    
    # Search takes precedence
    if search:
        return await task_repo.search(
            current_user.clerk_id,
            search,
            skip=pagination.skip,
            limit=pagination.limit
        )
    
    # Build filters
    filters = {}
    if status:
        filters["status"] = status
    if priority:
        filters["priority"] = priority
    if project_id:
        filters["project_id"] = project_id
    if assignee_id:
        filters["assignee_id"] = assignee_id
    
    # Handle overdue filter
    if is_overdue:
        return await task_repo.get_overdue(
            current_user.clerk_id,
            skip=pagination.skip,
            limit=pagination.limit
        )
    
    # Get tasks with filters
    return await task_repo.get_multi_by_user(
        current_user.clerk_id,
        skip=pagination.skip,
        limit=pagination.limit,
        filters=filters,
        order_by=sorting.order_by
    )


@router.get("/overdue", response_model=List[TaskSchema])
async def get_overdue_tasks(
    current_user: CurrentUser,
    db: DbSession,
    pagination: Pagination
) -> List[Task]:
    """Get all overdue tasks"""
    task_repo = TaskRepository(Task, db)
    return await task_repo.get_overdue(
        current_user.clerk_id,
        skip=pagination.skip,
        limit=pagination.limit
    )


@router.get("/stats", response_model=Dict[str, Any])
async def get_task_stats(
    current_user: CurrentUser,
    db: DbSession
) -> Dict[str, Any]:
    """Get task statistics for current user"""
    task_repo = TaskRepository(Task, db)
    return await task_repo.get_stats(current_user.clerk_id)


@router.get("/{task_id}", response_model=TaskSchema)
async def get_task(
    task_id: UUID,
    current_user: CurrentUser,
    db: DbSession
) -> Task:
    """Get a specific task with all relations"""
    task_repo = TaskRepository(Task, db)
    task = await task_repo.get_with_relations(current_user.clerk_id, task_id)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return task


@router.patch("/{task_id}", response_model=TaskSchema)
async def update_task(
    task_id: UUID,
    task_update: TaskUpdate,
    current_user: CurrentUser,
    db: DbSession
) -> Task:
    """Update a task"""
    task_repo = TaskRepository(Task, db)
    
    # Convert to dict, excluding unset fields
    update_data = task_update.model_dump(exclude_unset=True)
    
    # Update task
    task = await task_repo.update_for_user(
        current_user.clerk_id,
        task_id,
        update_data
    )
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Return with relations
    return await task_repo.get_with_relations(current_user.clerk_id, task_id)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: UUID,
    current_user: CurrentUser,
    db: DbSession
) -> None:
    """Delete a task (soft delete)"""
    task_repo = TaskRepository(Task, db)
    
    success = await task_repo.delete_for_user(current_user.clerk_id, task_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )


@router.post("/{task_id}/complete", response_model=TaskSchema)
async def complete_task(
    task_id: UUID,
    current_user: CurrentUser,
    db: DbSession
) -> Task:
    """Mark a task as completed"""
    task_repo = TaskRepository(Task, db)
    
    task = await task_repo.complete_task(current_user.clerk_id, task_id)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Return with relations
    return await task_repo.get_with_relations(current_user.clerk_id, task_id)


@router.get("/{task_id}/subtasks", response_model=List[TaskSchema])
async def get_subtasks(
    task_id: UUID,
    current_user: CurrentUser,
    db: DbSession
) -> List[Task]:
    """Get all subtasks of a parent task"""
    task_repo = TaskRepository(Task, db)
    return await task_repo.get_subtasks(current_user.clerk_id, task_id)


# Project endpoints
@router.post("/projects", response_model=ProjectSchema, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_in: ProjectCreate,
    current_user: CurrentUser,
    db: DbSession
) -> Project:
    """Create a new project"""
    project_repo = ProjectRepository(Project, db)
    
    project_data = project_in.model_dump()
    project = await project_repo.create_for_user(current_user.clerk_id, project_data)
    
    # Get with task count
    result = await project_repo.get_with_task_count(current_user.clerk_id, project.id)
    return result["project"]


@router.get("/projects", response_model=List[ProjectSchema])
async def get_projects(
    current_user: CurrentUser,
    db: DbSession,
    pagination: Pagination,
    active_only: bool = True
) -> List[Project]:
    """Get all projects"""
    project_repo = ProjectRepository(Project, db)
    
    if active_only:
        return await project_repo.get_active_projects(
            current_user.clerk_id,
            skip=pagination.skip,
            limit=pagination.limit
        )
    
    return await project_repo.get_multi_by_user(
        current_user.clerk_id,
        skip=pagination.skip,
        limit=pagination.limit
    )


@router.get("/projects/{project_id}", response_model=ProjectSchema)
async def get_project(
    project_id: UUID,
    current_user: CurrentUser,
    db: DbSession
) -> Project:
    """Get a specific project with task count"""
    project_repo = ProjectRepository(Project, db)
    result = await project_repo.get_with_task_count(current_user.id, project_id)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Set task_count on project
    project = result["project"]
    project.task_count = result["task_count"]
    return project


@router.patch("/projects/{project_id}", response_model=ProjectSchema)
async def update_project(
    project_id: UUID,
    project_update: ProjectUpdate,
    current_user: CurrentUser,
    db: DbSession
) -> Project:
    """Update a project"""
    project_repo = ProjectRepository(Project, db)
    
    update_data = project_update.model_dump(exclude_unset=True)
    project = await project_repo.update_for_user(
        current_user.clerk_id,
        project_id,
        update_data
    )
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Get with task count
    result = await project_repo.get_with_task_count(current_user.id, project_id)
    project.task_count = result["task_count"]
    return project


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID,
    current_user: CurrentUser,
    db: DbSession
) -> None:
    """Delete a project (soft delete)"""
    project_repo = ProjectRepository(Project, db)
    
    success = await project_repo.delete_for_user(current_user.clerk_id, project_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )


@router.get("/projects/{project_id}/tasks", response_model=List[TaskSchema])
async def get_project_tasks(
    project_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
    pagination: Pagination
) -> List[Task]:
    """Get all tasks in a project"""
    task_repo = TaskRepository(Task, db)
    return await task_repo.get_by_project(
        current_user.clerk_id,
        project_id,
        skip=pagination.skip,
        limit=pagination.limit
    )