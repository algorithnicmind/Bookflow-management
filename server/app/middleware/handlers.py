import time
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.logger import logger
import traceback

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        response = await call_next(request)
        
        process_time = (time.time() - start_time) * 1000
        formatted_process_time = '{0:.2f}'.format(process_time)
        
        logger.info(f"{request.method} {request.url.path} - Status {response.status_code} - {formatted_process_time}ms")
        
        return response

async def global_exception_handler(request: Request, exc: Exception):
    # Log the full stack trace securely
    logger.error(f"Unhandled Exception: {exc}\n{traceback.format_exc()}")
    
    # Return a generic error to the client to avoid leaking internals
    return JSONResponse(
        status_code=500,
        content={"error": {"code": 500, "message": "Internal Server Error"}},
    )
