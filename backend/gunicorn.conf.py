"""
Gunicorn configuration for production.
Used automatically when running: gunicorn -c gunicorn.conf.py app.main:app
"""
import multiprocessing

# Workers: 2 per CPU core is a good starting point for async workers
workers = multiprocessing.cpu_count() * 2
worker_class = "uvicorn.workers.UvicornWorker"

bind = "0.0.0.0:8000"
timeout = 120
keepalive = 5
max_requests = 1000          # Restart workers after N requests (prevents memory leaks)
max_requests_jitter = 100    # Randomise restart to avoid thundering herd

# Logging
accesslog = "-"   # stdout
errorlog = "-"    # stderr
loglevel = "info"

# Security
limit_request_line = 4096
limit_request_fields = 100
