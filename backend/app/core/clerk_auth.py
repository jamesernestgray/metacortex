"""
Clerk authentication utilities for JWT verification.
"""
import httpx
import json
import logging
import base64
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import HTTPException, status

from app.core.config import settings

logger = logging.getLogger(__name__)


class ClerkAuth:
    """Handle Clerk JWT verification and user data extraction."""
    
    def __init__(self):
        self._jwks_cache: Optional[Dict[str, Any]] = None
        self._jwks_cache_time: Optional[datetime] = None
        self._cache_duration = timedelta(hours=1)
        
    @property
    def jwks_url(self) -> str:
        """Get JWKS URL from Clerk publishable key."""
        # The publishable key format: pk_test_<base64-encoded-domain>
        publishable_key = settings.CLERK_PUBLISHABLE_KEY
        
        # Remove the prefix
        if publishable_key.startswith("pk_test_"):
            encoded_domain = publishable_key[8:]  # Remove "pk_test_"
        else:
            encoded_domain = publishable_key
            
        # The domain part is base64 encoded, decode it
        try:
            # Add padding if needed for base64 decoding
            padding = 4 - len(encoded_domain) % 4
            if padding != 4:
                encoded_domain += '=' * padding
                
            decoded_domain = base64.b64decode(encoded_domain).decode('utf-8')
            # Remove trailing $ if present
            decoded_domain = decoded_domain.rstrip('$')
            
            # The JWKS URL format for Clerk
            return f"https://{decoded_domain}/.well-known/jwks.json"
        except Exception as e:
            logger.error(f"Failed to decode Clerk domain: {str(e)}")
            # Fallback to a common Clerk JWKS pattern
            return "https://api.clerk.dev/.well-known/jwks.json"
    
    async def get_jwks(self) -> Dict[str, Any]:
        """Fetch JWKS from Clerk, with caching."""
        now = datetime.utcnow()
        
        # Return cached JWKS if still valid
        if (self._jwks_cache and 
            self._jwks_cache_time and 
            now - self._jwks_cache_time < self._cache_duration):
            return self._jwks_cache
        
        # Fetch new JWKS
        jwks_url = self.jwks_url
        logger.info(f"Fetching JWKS from: {jwks_url}")
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(jwks_url)
                response.raise_for_status()
                self._jwks_cache = response.json()
                self._jwks_cache_time = now
                logger.info("Successfully fetched JWKS")
                return self._jwks_cache
            except httpx.RequestError as e:
                logger.error(f"Failed to fetch JWKS from {jwks_url}: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"Failed to fetch JWKS: {str(e)}"
                )
    
    async def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify Clerk JWT token and return claims."""
        try:
            # Get JWKS
            jwks = await self.get_jwks()
            
            # Decode token header to get kid
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get("kid")
            
            if not kid:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token missing kid header"
                )
            
            # Find the key
            key = None
            for jwk in jwks.get("keys", []):
                if jwk.get("kid") == kid:
                    key = jwk
                    break
            
            if not key:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Unable to find appropriate key"
                )
            
            # Verify and decode token
            payload = jwt.decode(
                token,
                key,
                algorithms=["RS256"],
                options={
                    "verify_aud": False,  # Clerk doesn't use audience
                    "verify_exp": True,   # Verify expiration
                    "leeway": 60         # Allow 60 seconds of leeway for clock skew
                }
            )
            
            return payload
            
        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token: {str(e)}"
            )
    
    def extract_user_info(self, claims: Dict[str, Any]) -> Dict[str, Any]:
        """Extract user information from JWT claims."""
        logger.info(f"JWT claims received: {claims}")
        
        # Map Clerk claim names to our user info
        user_info = {
            "clerk_id": claims.get("sub"),
            "email": claims.get("email") or claims.get("primary_email_address"),
            "email_verified": claims.get("email_verified", False),
            "first_name": claims.get("first_name") or claims.get("given_name"),
            "last_name": claims.get("last_name") or claims.get("family_name"),
            "username": claims.get("username") or claims.get("preferred_username"),
            "profile_image_url": claims.get("profile_image_url") or claims.get("image_url"),
            "session_id": claims.get("sid"),
        }
        
        logger.info(f"Extracted user info: {user_info}")
        return user_info


# Global instance
clerk_auth = ClerkAuth()