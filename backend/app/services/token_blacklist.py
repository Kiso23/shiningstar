"""
Token blacklist service for logout functionality.
Uses Redis to store blacklisted JWT tokens.
"""
import os
from typing import Optional
import redis
from datetime import datetime, timedelta


class TokenBlacklistService:
    def __init__(self):
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        try:
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            # Test connection
            self.redis_client.ping()
            self.enabled = True
        except Exception as e:
            print(f"Warning: Redis not available for token blacklist: {e}")
            self.enabled = False

    def blacklist_token(self, token: str, expires_in_seconds: int = 86400) -> bool:
        """Add a token to the blacklist. Defaults to 24 hours."""
        if not self.enabled:
            return False
        try:
            # Store token in Redis with expiration
            key = f"blacklist:{token}"
            self.redis_client.setex(key, expires_in_seconds, "true")
            return True
        except Exception as e:
            print(f"Error blacklisting token: {e}")
            return False

    def is_token_blacklisted(self, token: str) -> bool:
        """Check if a token is blacklisted."""
        if not self.enabled:
            return False
        try:
            key = f"blacklist:{token}"
            return self.redis_client.exists(key) > 0
        except Exception as e:
            print(f"Error checking token blacklist: {e}")
            return False

    def clear_token(self, token: str) -> bool:
        """Remove a token from the blacklist."""
        if not self.enabled:
            return False
        try:
            key = f"blacklist:{token}"
            self.redis_client.delete(key)
            return True
        except Exception as e:
            print(f"Error clearing token: {e}")
            return False


# Global instance
token_blacklist = TokenBlacklistService()
