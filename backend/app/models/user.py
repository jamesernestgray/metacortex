from sqlalchemy import Column, String, Boolean, JSON

from app.models.base import BaseModel


class User(BaseModel):
    """
    User model - synced with Clerk authentication
    """
    __tablename__ = "users"
    
    # Clerk user ID (primary identifier)
    clerk_id = Column(String, unique=True, nullable=False, index=True)
    
    # Basic user information from Clerk
    email = Column(String, unique=True, nullable=False, index=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    username = Column(String, unique=True, nullable=True, index=True)
    full_name = Column(String, nullable=True)
    
    # User status
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    # User preferences and settings
    preferences = Column(JSON, default=dict, nullable=False)
    
    # Feature flags
    enabled_modules = Column(JSON, default=list, nullable=False)
    
    # Note: No relationships defined here since other models use user_id as string
    # Access user's tasks, notes, habits via repositories instead
    
    @property
    def full_name(self) -> str:
        """Get user's full name"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.first_name or self.last_name or self.username or self.email
    
    def has_module(self, module_name: str) -> bool:
        """Check if user has a specific module enabled"""
        return module_name in self.enabled_modules