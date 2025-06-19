from typing import Optional, List, Dict, Any
from uuid import UUID
from sqlalchemy import select, and_, or_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository for user operations"""
    
    async def get_by_clerk_id(self, clerk_id: str) -> Optional[User]:
        """Get user by Clerk ID"""
        query = select(User).where(
            and_(
                User.clerk_id == clerk_id,
                User.is_deleted == False
            )
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        query = select(User).where(
            and_(
                User.email == email,
                User.is_deleted == False
            )
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        query = select(User).where(
            and_(
                User.username == username,
                User.is_deleted == False
            )
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_active_users(
        self,
        skip: int = 0,
        limit: int = 100
    ) -> List[User]:
        """Get active users"""
        return await self.get_multi(
            skip=skip,
            limit=limit,
            filters={"is_active": True}
        )
    
    async def update_preferences(
        self,
        user_id: UUID,
        preferences: Dict[str, Any]
    ) -> Optional[User]:
        """Update user preferences"""
        user = await self.get(user_id)
        if not user:
            return None
        
        # Merge preferences
        current_prefs = user.preferences or {}
        current_prefs.update(preferences)
        user.preferences = current_prefs
        
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def update_enabled_modules(
        self,
        user_id: UUID,
        modules: List[str]
    ) -> Optional[User]:
        """Update user's enabled modules"""
        user = await self.get(user_id)
        if not user:
            return None
        
        user.enabled_modules = modules
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def activate_user(self, user_id: UUID) -> Optional[User]:
        """Activate a user"""
        user = await self.get(user_id)
        if not user:
            return None
        
        user.is_active = True
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def deactivate_user(self, user_id: UUID) -> Optional[User]:
        """Deactivate a user"""
        user = await self.get(user_id)
        if not user:
            return None
        
        user.is_active = False
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def search_users(
        self,
        query: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[User]:
        """Search users by name, username, or email"""
        search_query = select(User).where(
            and_(
                User.is_deleted == False,
                User.is_active == True,
                or_(
                    User.email.ilike(f"%{query}%"),
                    User.username.ilike(f"%{query}%"),
                    User.first_name.ilike(f"%{query}%"),
                    User.last_name.ilike(f"%{query}%")
                )
            )
        ).order_by(User.created_at.desc()).offset(skip).limit(limit)
        
        result = await self.db.execute(search_query)
        return result.scalars().all()
    
    async def get_stats(self) -> Dict[str, Any]:
        """Get user statistics"""
        # Total users
        total_query = select(func.count(User.id)).where(
            User.is_deleted == False
        )
        total_result = await self.db.execute(total_query)
        total = total_result.scalar() or 0
        
        # Active users
        active_query = select(func.count(User.id)).where(
            and_(
                User.is_deleted == False,
                User.is_active == True
            )
        )
        active_result = await self.db.execute(active_query)
        active = active_result.scalar() or 0
        
        # Verified users
        verified_query = select(func.count(User.id)).where(
            and_(
                User.is_deleted == False,
                User.is_verified == True
            )
        )
        verified_result = await self.db.execute(verified_query)
        verified = verified_result.scalar() or 0
        
        return {
            "total": total,
            "active": active,
            "verified": verified,
            "inactive": total - active
        }