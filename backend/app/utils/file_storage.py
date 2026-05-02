import os
import uuid


def save_file(dest_dir: str, filename_prefix: str, file_bytes: bytes, original_filename: str) -> str:
    """Save file bytes to dest_dir with a UUID prefix. Returns the full file path."""
    os.makedirs(dest_dir, exist_ok=True)
    ext = os.path.splitext(original_filename)[1].lower()
    filename = f"{filename_prefix}_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(dest_dir, filename)
    with open(file_path, "wb") as f:
        f.write(file_bytes)
    return file_path


def delete_file(path: str) -> None:
    """Delete a file if it exists. Silently ignores missing files."""
    try:
        if path and os.path.exists(path):
            os.remove(path)
    except OSError:
        pass
