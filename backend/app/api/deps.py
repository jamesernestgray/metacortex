from typing import Optional, Annotated, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.clerk_auth import clerk_auth
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.user import UserCreate


# Security scheme
security = HTTPBearer()


async def get_clerk_user_info(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]
) -> Dict[str, Any]:
    """
    Verify Clerk token and extract user information.
    
    This function verifies the JWT token locally and returns user info.
    """
    token = credentials.credentials
    
    # In development, allow a test token
    if settings.ENVIRONMENT == "development" and token == "test-token":
        return {
            "clerk_id": "test-user-id",
            "email": "test@example.com",
            "email_verified": True,
            "first_name": "Test",
            "last_name": "User",
            "username": "testuser",
            "profile_image_url": None,
            "session_id": "test-session"
        }
    
    # Verify token with Clerk
    claims = await clerk_auth.verify_token(token)
    return clerk_auth.extract_user_info(claims)


async def get_current_user(
    user_info: Annotated[Dict[str, Any], Depends(get_clerk_user_info)],
    db: Annotated[AsyncSession, Depends(get_db)]
) -> User:
    """
    Get current user from database, creating if necessary.
    
    This function uses the user info from Clerk to fetch or create the user.
    """
    user_repo = UserRepository(User, db)
    clerk_id = user_info["clerk_id"]
    
    # Try to get existing user
    user = await user_repo.get_by_clerk_id(clerk_id)
    
    if not user:
        # Create new user from Clerk data
        # If email is not in JWT, create a temporary one based on clerk_id
        email = user_info.get("email") or f"{clerk_id}@clerk.temp"
        
        user_create = UserCreate(
            email=email,
            clerk_id=clerk_id,
            username=user_info.get("username") or clerk_id[:8],
            first_name=user_info.get("first_name"),
            last_name=user_info.get("last_name"),
            is_active=True,
            is_verified=user_info.get("email_verified", False)
        )
        
        try:
            user = await user_repo.create(user_create.model_dump())
            await db.commit()
        except Exception as e:
            await db.rollback()
            raise
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found and could not be created"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    # Update user info if changed
    update_data = {}
    if user_info.get("email") and user.email != user_info["email"]:
        update_data["email"] = user_info["email"]
    if user_info.get("username") and user.username != user_info["username"]:
        update_data["username"] = user_info["username"]
    if user_info.get("first_name") and user.first_name != user_info["first_name"]:
        update_data["first_name"] = user_info["first_name"]
    if user_info.get("last_name") and user.last_name != user_info["last_name"]:
        update_data["last_name"] = user_info["last_name"]
    
    if update_data:
        user = await user_repo.update(user.id, update_data)
        await db.commit()
    
    return user


# Optional user dependency (for endpoints that work with or without auth)
async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """
    Get current user if authenticated, otherwise None.
    
    Used for endpoints that have different behavior for authenticated vs anonymous users.
    """
    if not credentials:
        return None
    
    try:
        user_info = await get_clerk_user_info(credentials)
        return await get_current_user(user_info, db)
    except HTTPException:
        return None


# Common query parameters
class PaginationParams:
    """Common pagination parameters"""
    
    def __init__(
        self,
        skip: int = 0,
        limit: int = 100,
    ):
        self.skip = skip
        self.limit = min(limit, 1000)  # Cap at 1000 to prevent abuse


class SortParams:
    """Common sorting parameters"""
    
    def __init__(
        self,
        sort_by: Optional[str] = None,
        sort_desc: bool = False,
    ):
        self.sort_by = sort_by
        self.sort_desc = sort_desc
        
    @property
    def order_by(self) -> Optional[str]:
        """Get order_by string for repository"""
        if not self.sort_by:
            return None
        return f"-{self.sort_by}" if self.sort_desc else self.sort_by


# Type aliases for cleaner code
CurrentUser = Annotated[User, Depends(get_current_user)]
ClerkUserInfo = Annotated[Dict[str, Any], Depends(get_clerk_user_info)]
DbSession = Annotated[AsyncSession, Depends(get_db)]
Pagination = Annotated[PaginationParams, Depends()]
Sorting = Annotated[SortParams, Depends()]