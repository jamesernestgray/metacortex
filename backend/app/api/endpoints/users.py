from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from uuid import UUID

from app.api.deps import CurrentUser, DbSession, Pagination
from app.models.user import User
from app.schemas.user import User as UserSchema, UserUpdate, UserPublic
from app.repositories.user import UserRepository

router = APIRouter()


@router.get("/me", response_model=UserSchema)
async def get_current_user_me(
    current_user: CurrentUser
) -> User:
    """Get current user's profile"""
    return current_user


@router.patch("/me", response_model=UserSchema)
async def update_current_user(
    user_update: UserUpdate,
    current_user: CurrentUser,
    db: DbSession
) -> User:
    """Update current user's profile"""
    user_repo = UserRepository(User, db)
    
    # Convert update data to dict, excluding unset fields
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Update user
    updated_user = await user_repo.update(current_user.id, update_data)
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return updated_user


@router.get("/search", response_model=List[UserPublic])
async def search_users(
    q: str,
    current_user: CurrentUser,
    db: DbSession,
    pagination: Pagination
) -> List[User]:
    """
    Search for users by name, username, or email.
    
    Returns public user information only.
    """
    if len(q) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query must be at least 2 characters"
        )
    
    user_repo = UserRepository(User, db)
    users = await user_repo.search_users(
        q,
        skip=pagination.skip,
        limit=pagination.limit
    )
    
    return users


@router.get("/{user_id}", response_model=UserPublic)
async def get_user(
    user_id: UUID,
    current_user: CurrentUser,
    db: DbSession
) -> User:
    """Get public information about a specific user"""
    user_repo = UserRepository(User, db)
    user = await user_repo.get(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.patch("/me/preferences", response_model=UserSchema)
async def update_preferences(
    preferences: dict,
    current_user: CurrentUser,
    db: DbSession
) -> User:
    """Update current user's preferences"""
    user_repo = UserRepository(User, db)
    
    updated_user = await user_repo.update_preferences(
        current_user.id,
        preferences
    )
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return updated_user


@router.patch("/me/modules", response_model=UserSchema)
async def update_enabled_modules(
    modules: List[str],
    current_user: CurrentUser,
    db: DbSession
) -> User:
    """Update current user's enabled modules"""
    # Validate modules
    valid_modules = {"tasks", "notes", "habits", "calendar", "workflows"}
    invalid_modules = set(modules) - valid_modules
    
    if invalid_modules:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid modules: {', '.join(invalid_modules)}"
        )
    
    user_repo = UserRepository(User, db)
    
    updated_user = await user_repo.update_enabled_modules(
        current_user.id,
        modules
    )
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return updated_user