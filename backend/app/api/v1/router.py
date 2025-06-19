from fastapi import APIRouter

# Import future routers here
# from app.api.v1.endpoints import tasks, notes, habits, auth

api_router = APIRouter()

# Include routers
# api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
# api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
# api_router.include_router(notes.router, prefix="/notes", tags=["notes"])
# api_router.include_router(habits.router, prefix="/habits", tags=["habits"])