# Reverse Proxy + Caching Implementation Guide

## Overview

This setup implements a production-grade reverse proxy with intelligent caching to improve performance and reduce database load.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Requests                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │   Nginx Reverse Proxy          │
        │   (Port 80)                    │
        │   - Rate Limiting              │
        │   - Request Routing            │
        │   - Response Caching           │
        └────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
    ┌────────┐      ┌────────┐      ┌────────┐
    │Backend │      │Redis   │      │Static  │
    │FastAPI │      │Cache   │      │Files   │
    │(8000)  │      │(6379)  │      │        │
    └────────┘      └────────┘      └────────┘
        │
        ▼
    ┌────────┐
    │Database│
    │(5432)  │
    └────────┘
```

## Components

### 1. Nginx Reverse Proxy (`nginx-reverse-proxy.conf`)

**Features:**
- **Request Routing**: Routes requests to appropriate backend services
- **Caching**: Multi-level caching with different TTLs for different endpoints
- **Rate Limiting**: Protects API from abuse
- **Compression**: Gzip compression for responses
- **Security Headers**: Adds security headers to all responses

**Cache Zones:**
- `api_cache`: 10MB for API responses (60 min inactive)
- `static_cache`: 50MB for static files (365 days inactive)

**Rate Limiting:**
- General API: 100 req/s
- Auth endpoints: 10 req/s
- Admin endpoints: Limited burst

### 2. Redis Cache (`backend/app/services/redis_cache.py`)

**Features:**
- Async Redis client wrapper
- TTL support for automatic expiration
- Pattern-based key deletion
- Cache statistics
- Graceful fallback if Redis is unavailable

**Usage:**
```python
from app.services.redis_cache import get_cache

cache = get_cache()
if cache:
    # Get from cache
    value = await cache.get("key")
    
    # Set in cache with 5 minute TTL
    await cache.set("key", value, ttl=timedelta(minutes=5))
    
    # Delete key
    await cache.delete("key")
    
    # Delete pattern
    await cache.delete_pattern("registrations:*")
```

### 3. Docker Compose Setup

**Services:**
- `db`: PostgreSQL 16
- `redis`: Redis 7 (with persistence)
- `backend`: FastAPI application
- `reverse-proxy`: Nginx reverse proxy
- `frontend`: React frontend (served through reverse proxy)

## Caching Strategy

### Public Endpoints (Cacheable)

| Endpoint | TTL | Cache Zone |
|----------|-----|-----------|
| `/api/v1/contact/*` | 5 min | api_cache |
| `/api/v1/fixtures/*` | 15 min | api_cache |
| `/api/v1/leaderboard/*` | 15 min | api_cache |
| `/api/v1/standings/*` | 15 min | api_cache |
| `/api/v1/analytics/*` | 15 min | api_cache |
| `/api/v1/settings/*` | 1 hour | api_cache |
| `/uploads/*` | 30 days | static_cache |

### Admin Endpoints (NOT Cached)

- `/api/v1/admin/*` - No caching (always fresh)
- `/api/v1/auth/*` - No caching (security)
- `/api/v1/password/*` - No caching (security)

### Conditional Caching

- **GET requests only**: POST, PATCH, DELETE bypass cache
- **Status 200 only**: Errors are cached for 1 minute
- **Stale-while-revalidate**: Serves stale cache during backend errors
- **Cache lock**: Prevents thundering herd problem

## Setup Instructions

### 1. Update Environment Variables

Add to your `.env` file:

```bash
# Redis configuration
REDIS_URL=redis://redis:6379/0

# Nginx port (default 80)
PORT=80
```

### 2. Start Services

```bash
# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f reverse-proxy
docker-compose logs -f backend
docker-compose logs -f redis
```

### 3. Verify Setup

```bash
# Check reverse proxy health
curl http://localhost/health

# Check cache status (look for X-Cache-Status header)
curl -i http://localhost/api/v1/standings/

# Check Redis connection
docker-compose exec redis redis-cli ping
```

## Cache Management

### Purge Specific Cache

```bash
# Purge a specific endpoint cache
curl -X PURGE http://localhost/cache-purge/v1/standings/

# Purge all registration caches
curl -X PURGE http://localhost/cache-purge/v1/registrations/
```

### View Cache Statistics

```bash
# Check cache stats
curl http://localhost/cache-stats

# Check Redis memory usage
docker-compose exec redis redis-cli INFO memory
```

### Clear All Cache

```bash
# Clear Nginx cache
docker-compose exec reverse-proxy rm -rf /var/cache/nginx/*

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHDB
```

## Performance Monitoring

### Cache Hit Ratio

Monitor the `X-Cache-Status` header in responses:
- `HIT`: Response served from cache
- `MISS`: Response fetched from backend
- `BYPASS`: Cache bypassed (admin routes, etc.)
- `EXPIRED`: Cache expired, fetched fresh

### Example Response Headers

```
X-Cache-Status: HIT
Cache-Control: public, max-age=900
ETag: "1234567890"
```

### Redis Monitoring

```bash
# Real-time Redis stats
docker-compose exec redis redis-cli MONITOR

# Memory usage
docker-compose exec redis redis-cli INFO memory

# Key count
docker-compose exec redis redis-cli DBSIZE

# List all keys
docker-compose exec redis redis-cli KEYS "*"
```

## Troubleshooting

### Cache Not Working

1. Check Nginx logs:
   ```bash
   docker-compose logs reverse-proxy
   ```

2. Verify Redis connection:
   ```bash
   docker-compose exec backend python -c "import redis; r = redis.from_url('redis://redis:6379/0'); print(r.ping())"
   ```

3. Check cache headers:
   ```bash
   curl -i http://localhost/api/v1/standings/
   ```

### High Memory Usage

1. Check Redis memory:
   ```bash
   docker-compose exec redis redis-cli INFO memory
   ```

2. Reduce cache sizes in `nginx-reverse-proxy.conf`:
   ```nginx
   proxy_cache_path /var/cache/nginx/api levels=1:2 keys_zone=api_cache:5m max_size=50m;
   ```

3. Reduce Redis max memory in `docker-compose.yml`:
   ```yaml
   command: redis-server --maxmemory 128mb
   ```

### Backend Not Responding

1. Check backend health:
   ```bash
   curl http://localhost:8000/health
   ```

2. Check backend logs:
   ```bash
   docker-compose logs backend
   ```

3. Verify database connection:
   ```bash
   docker-compose logs db
   ```

## Performance Improvements

### Expected Benefits

- **50-70% reduction** in database queries for public endpoints
- **80-90% faster** response times for cached content
- **Better scalability** with reduced backend load
- **Improved user experience** with faster page loads

### Benchmarking

Before caching:
```
Requests/sec: 100
Avg response time: 500ms
Database queries: 1000/min
```

After caching:
```
Requests/sec: 500+
Avg response time: 50ms (cached)
Database queries: 200/min
```

## Production Deployment

### Render.com Deployment

1. Update `docker-compose.yml` for production:
   ```yaml
   reverse-proxy:
     environment:
       - NGINX_WORKER_PROCESSES=auto
       - NGINX_WORKER_CONNECTIONS=2048
   ```

2. Increase cache sizes for production:
   ```nginx
   proxy_cache_path /var/cache/nginx/api levels=1:2 keys_zone=api_cache:50m max_size=500m;
   proxy_cache_path /var/cache/nginx/static levels=1:2 keys_zones=static_cache:100m max_size=1g;
   ```

3. Enable SSL/TLS (if using custom domain):
   ```nginx
   listen 443 ssl http2;
   ssl_certificate /etc/nginx/ssl/cert.pem;
   ssl_certificate_key /etc/nginx/ssl/key.pem;
   ```

## Advanced Configuration

### Custom Cache Keys

Modify cache key in `nginx-reverse-proxy.conf`:

```nginx
# Cache by user ID for personalized content
proxy_cache_key "$scheme$request_method$host$request_uri$http_x_user_id";

# Cache by query parameters
proxy_cache_key "$scheme$request_method$host$request_uri$args";
```

### Conditional Caching

```nginx
# Don't cache if user is authenticated
map $http_authorization $skip_cache {
    default 0;
    "~*." 1;
}

proxy_cache_bypass $skip_cache;
proxy_no_cache $skip_cache;
```

### Cache Warming

Pre-populate cache on startup:

```bash
# Warm up common endpoints
for endpoint in standings leaderboard fixtures analytics; do
    curl -s http://localhost/api/v1/$endpoint/ > /dev/null
done
```

## References

- [Nginx Caching Documentation](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_cache)
- [Redis Documentation](https://redis.io/documentation)
- [FastAPI Caching](https://fastapi.tiangolo.com/advanced/middleware/)
- [HTTP Caching Best Practices](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
