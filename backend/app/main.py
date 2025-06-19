from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime

from app.core.config import settings
from app.api.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application lifecycle - startup and shutdown events
    """
    # Startup
    print("Starting up Metacortex API...")
    yield
    # Shutdown
    print("Shutting down Metacortex API...")


# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint returning application status"""
    return {
        "status": "healthy",
        "service": "Metacortex API",
        "version": settings.VERSION,
        "timestamp": datetime.utcnow().isoformat()
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """Detailed health check endpoint"""
    return {
        "status": "healthy",
        "service": "Metacortex API",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {
            "api": "operational",
            "database": "pending",  # Will be implemented with DB connection
            "cache": "pending",     # Will be implemented with Redis
        }
    }


# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)