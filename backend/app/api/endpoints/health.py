from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import DbSession
from app.core.config import settings

router = APIRouter()


@router.get("/health")
async def health_check() -> Dict[str, str]:
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "service": "metacortex-api",
        "version": "1.0.0"
    }


@router.get("/health/ready")
async def readiness_check(db: DbSession) -> Dict[str, Any]:
    """
    Readiness check endpoint.
    
    Verifies that the service is ready to handle requests by checking:
    - Database connectivity
    - Required environment variables
    """
    checks = {
        "database": False,
        "config": False,
        "status": "not_ready"
    }
    
    # Check database
    try:
        result = await db.execute(text("SELECT 1"))
        checks["database"] = result.scalar() == 1
    except Exception:
        pass
    
    # Check critical config
    checks["config"] = bool(
        settings.DATABASE_URL and
        settings.SECRET_KEY
    )
    
    # Overall status
    if all([checks["database"], checks["config"]]):
        checks["status"] = "ready"
    
    return checks