"""
Simple in-memory sliding window rate limiter.
Used to protect the login endpoint from brute force attacks.

Limits: 5 attempts per IP per 60 seconds.
On Render with 2 workers, each worker has its own counter — acceptable for free tier.
"""
import time
from collections import defaultdict, deque
from typing import Deque, Dict

from fastapi import HTTPException, Request, status


class SlidingWindowRateLimiter:
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        # ip -> deque of timestamps
        self._windows: Dict[str, Deque[float]] = defaultdict(deque)

    def check(self, ip: str) -> None:
        """Raise 429 if the IP has exceeded the rate limit."""
        now = time.monotonic()
        window = self._windows[ip]

        # Remove timestamps outside the window
        cutoff = now - self.window_seconds
        while window and window[0] < cutoff:
            window.popleft()

        if len(window) >= self.max_requests:
            retry_after = int(self.window_seconds - (now - window[0])) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many login attempts. Try again in {retry_after} seconds.",
                headers={"Retry-After": str(retry_after)},
            )

        window.append(now)

    def get_client_ip(self, request: Request) -> str:
        """Extract real IP, respecting X-Forwarded-For from Render's proxy."""
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"


# Global limiter: 5 login attempts per 60 seconds per IP
login_limiter = SlidingWindowRateLimiter(max_requests=5, window_seconds=60)
