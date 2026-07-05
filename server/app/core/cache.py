import json
import logging
from typing import Any, Callable
import redis.asyncio as redis
from app.core.config import settings

logger = logging.getLogger("leaveflow.cache")

class CacheService:
    def __init__(self):
        # Only initialize if REDIS_URL is provided, else fallback to in-memory (dummy) or None
        self.redis_url = getattr(settings, "REDIS_URL", None)
        self.client = redis.from_url(self.redis_url) if self.redis_url else None
        
    async def get_or_compute(self, key: str, ttl: int, compute_fn: Callable) -> Any:
        if not self.client:
            # If no redis is configured, just compute and return
            return await compute_fn()
            
        try:
            cached = await self.client.get(key)
            if cached:
                return json.loads(cached)
                
            result = await compute_fn()
            
            # Serialize result to JSON string. Ensure datetime objects are handled if needed,
            # though usually the result is already serializable or we use default=str
            await self.client.setex(key, ttl, json.dumps(result, default=str))
            return result
        except Exception as e:
            logger.error(f"Redis cache error for {key}: {str(e)}")
            return await compute_fn()
