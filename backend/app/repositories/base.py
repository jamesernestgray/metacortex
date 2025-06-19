from typing import TypeVar, Generic, Type, Optional, List, Dict, Any
from uuid import UUID
from sqlalchemy import select, and_, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.base import BaseModel


ModelType = TypeVar("ModelType", bound=BaseModel)


class BaseRepository(Generic[ModelType]):
    """Base repository with common CRUD operations"""
    
    def __init__(self, model: Type[ModelType], db: AsyncSession):
        self.model = model
        self.db = db
    
    async def get(self, id: UUID) -> Optional[ModelType]:
        """Get a single record by ID"""
        query = select(self.model).where(
            and_(
                self.model.id == id,
                self.model.is_deleted == False
            )
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_multi(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[str] = None,
    ) -> List[ModelType]:
        """Get multiple records with pagination"""
        query = select(self.model).where(self.model.is_deleted == False)
        
        # Apply filters
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key) and value is not None:
                    query = query.where(getattr(self.model, key) == value)
        
        # Apply ordering
        if order_by:
            if order_by.startswith("-"):
                query = query.order_by(getattr(self.model, order_by[1:]).desc())
            else:
                query = query.order_by(getattr(self.model, order_by))
        else:
            query = query.order_by(self.model.created_at.desc())
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def create(self, obj_in: Dict[str, Any]) -> ModelType:
        """Create a new record"""
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        await self.db.commit()
        await self.db.refresh(db_obj)
        return db_obj
    
    async def update(
        self,
        id: UUID,
        obj_in: Dict[str, Any]
    ) -> Optional[ModelType]:
        """Update a record"""
        db_obj = await self.get(id)
        if not db_obj:
            return None
        
        for field, value in obj_in.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        
        await self.db.commit()
        await self.db.refresh(db_obj)
        return db_obj
    
    async def delete(self, id: UUID) -> bool:
        """Soft delete a record"""
        db_obj = await self.get(id)
        if not db_obj:
            return False
        
        db_obj.soft_delete()
        await self.db.commit()
        return True
    
    async def hard_delete(self, id: UUID) -> bool:
        """Permanently delete a record"""
        db_obj = await self.get(id)
        if not db_obj:
            return False
        
        await self.db.delete(db_obj)
        await self.db.commit()
        return True
    
    async def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """Count records matching filters"""
        query = select(func.count(self.model.id)).where(
            self.model.is_deleted == False
        )
        
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key) and value is not None:
                    query = query.where(getattr(self.model, key) == value)
        
        result = await self.db.execute(query)
        return result.scalar() or 0


class UserOwnedRepository(BaseRepository[ModelType]):
    """Repository for user-owned resources"""
    
    async def get_by_user(
        self,
        user_id: str,
        id: UUID
    ) -> Optional[ModelType]:
        """Get a record by ID for a specific user"""
        query = select(self.model).where(
            and_(
                self.model.id == id,
                self.model.user_id == user_id,
                self.model.is_deleted == False
            )
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_multi_by_user(
        self,
        user_id: str,
        *,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[str] = None,
    ) -> List[ModelType]:
        """Get multiple records for a specific user"""
        if filters is None:
            filters = {}
        filters["user_id"] = user_id
        return await self.get_multi(
            skip=skip,
            limit=limit,
            filters=filters,
            order_by=order_by
        )
    
    async def create_for_user(
        self,
        user_id: str,
        obj_in: Dict[str, Any]
    ) -> ModelType:
        """Create a record for a specific user"""
        obj_in["user_id"] = user_id
        return await self.create(obj_in)
    
    async def update_for_user(
        self,
        user_id: str,
        id: UUID,
        obj_in: Dict[str, Any]
    ) -> Optional[ModelType]:
        """Update a record for a specific user"""
        db_obj = await self.get_by_user(user_id, id)
        if not db_obj:
            return None
        
        for field, value in obj_in.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        
        await self.db.commit()
        await self.db.refresh(db_obj)
        return db_obj
    
    async def delete_for_user(
        self,
        user_id: str,
        id: UUID
    ) -> bool:
        """Delete a record for a specific user"""
        db_obj = await self.get_by_user(user_id, id)
        if not db_obj:
            return False
        
        db_obj.soft_delete()
        await self.db.commit()
        return True