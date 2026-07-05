"""
Pagination Utilities
--------------------
Reusable pagination components for consistent list endpoint behavior across all modules.

Usage in routes:
    from app.core.pagination import PaginationParams, PaginatedResponse

    @router.get("")
    async def list_items(pagination: PaginationParams = Depends()):
        items, total = await service.list_items(pagination.offset, pagination.per_page)
        return PaginatedResponse.build(items, total, pagination)
"""

from fastapi import Query
from pydantic import BaseModel
from typing import Any, List
import math


class PaginationParams:
    """
    FastAPI Dependency: Extracts and validates pagination query parameters.
    
    Query params:
        page: 1-indexed page number (default 1)
        per_page: items per page (default 50, max 100)
    
    Computed:
        offset: calculated skip value for SQL OFFSET
    """
    def __init__(
        self,
        page: int = Query(1, ge=1, description="Page number (1-indexed)"),
        per_page: int = Query(50, ge=1, le=100, description="Items per page (max 100)")
    ):
        self.page = page
        self.per_page = per_page
        self.offset = (page - 1) * per_page


class PaginatedResponse(BaseModel):
    """
    Standard wrapper for paginated API responses.
    Includes data, total count, current page, per_page, and total_pages.
    """
    data: List[Any]
    total: int
    page: int
    per_page: int
    total_pages: int

    @classmethod
    def build(cls, data: list, total: int, pagination: PaginationParams) -> "PaginatedResponse":
        """Convenience constructor from a data list and pagination params."""
        return cls(
            data=data,
            total=total,
            page=pagination.page,
            per_page=pagination.per_page,
            total_pages=max(1, math.ceil(total / pagination.per_page))
        )
