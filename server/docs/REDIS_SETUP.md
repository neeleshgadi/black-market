# Redis Caching Setup

This document explains how Redis caching is implemented in the Black Market Alien Store.

## Overview

Redis is used for:

- API response caching (alien listings, details, filters)
- Session storage (future enhancement)
- Frequently accessed data caching
- Search result caching

## Development Setup

### Option 1: Docker (Recommended)

```bash
# Start Redis using Docker Compose
docker-compose -f docker-compose.dev.yml up -d redis

# Check Redis status
docker-compose -f docker-compose.dev.yml ps
```

### Option 2: Local Redis Installation

```bash
# Windows (using Chocolatey)
choco install redis-64

# Or download from: https://github.com/microsoftarchive/redis/releases

# Start Redis server
redis-server

# Test connection
redis-cli ping
```

## Testing Redis

```bash
# Test Redis functionality
npm run test:redis

# Check server logs for Redis connection status
npm run dev
```

## Cache Configuration

### Cache TTL (Time To Live)

- **Alien listings**: 10 minutes (600s)
- **Alien details**: 15 minutes (900s)
- **Featured aliens**: 15 minutes (900s)
- **Filter options**: 30 minutes (1800s)
- **Related aliens**: 10 minutes (600s)

### Cache Keys

- `aliens:list:{page}:{limit}:{category}:{search}:{sort}` - Alien listings
- `alien:detail:{id}` - Individual alien details
- `alien:related:{id}` - Related aliens
- `aliens:featured` - Featured aliens
- `aliens:filter-options` - Filter dropdown options

## Cache Invalidation

Cache is automatically invalidated when:

- New alien is created → All alien caches cleared
- Alien is updated → Specific alien + list caches cleared
- Alien is deleted → Specific alien + list caches cleared

## Environment Variables

```env
# Development
REDIS_URL=redis://localhost:6379
REDIS_TTL_DEFAULT=300

# Production
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=your-redis-password
```

## Monitoring

### Health Check

The `/api/health` endpoint includes Redis status:

```json
{
  "redis": {
    "connected": true,
    "status": "connected"
  }
}
```

### Cache Headers

Responses include cache information:

- `X-Cache: HIT` - Response served from cache
- `X-Cache: MISS` - Response generated and cached
- `X-Cache-Key` - The cache key used

## Production Deployment

Redis is included in the production Docker setup:

```bash
# Deploy with Redis
docker-compose -f docker-compose.production.yml up -d
```

## Troubleshooting

### Redis Connection Issues

1. Check if Redis is running: `redis-cli ping`
2. Verify environment variables
3. Check Docker container status
4. Review server logs for Redis errors

### Cache Not Working

1. Verify Redis connection in health endpoint
2. Check cache headers in API responses
3. Review cache middleware logs
4. Test with `npm run test:redis`

### Performance Issues

1. Monitor Redis memory usage
2. Check cache hit/miss ratios in logs
3. Adjust TTL values if needed
4. Consider cache warming for popular data

## Cache Warming (Future Enhancement)

```javascript
// Example cache warming on server start
import { warmCache } from "./middleware/cache.js";

// Warm popular aliens cache
await warmCache.popularAliens();
```
