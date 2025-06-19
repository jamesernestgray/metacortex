#!/usr/bin/env python3
import sys
sys.path.append('.')

try:
    from app.core.config import settings
    print("Settings loaded successfully!")
    print(f"DATABASE_URL: {settings.DATABASE_URL}")
    print(f"BACKEND_CORS_ORIGINS: {settings.BACKEND_CORS_ORIGINS}")
except Exception as e:
    print(f"Error loading settings: {e}")
    import traceback
    traceback.print_exc()