import re
import html


def sanitize_text(value: str) -> str:
    """
    Strip HTML tags and escape HTML entities from user-supplied text.
    This prevents XSS payloads from being stored and rendered.
    SQLAlchemy's parameterized queries handle SQL injection prevention,
    so we focus on HTML/script sanitization here.
    """
    if not isinstance(value, str):
        return value
    # Remove HTML tags
    value = re.sub(r'<[^>]+>', '', value)
    # Escape remaining HTML entities
    value = html.escape(value, quote=True)
    return value.strip()
