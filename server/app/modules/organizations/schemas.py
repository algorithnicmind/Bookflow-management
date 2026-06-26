from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class OrganizationBase(BaseModel):
    name: str
    domain: Optional[str] = None
    plan_type: str
    module_access: Optional[Dict[str, Any]] = None
    max_employees: Optional[int] = None
    is_active: bool

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    plan_type: Optional[str] = None
    module_access: Optional[Dict[str, Any]] = None
    max_employees: Optional[int] = None
    is_active: Optional[bool] = None

class OrganizationResponse(OrganizationBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class RolePermissionUpdate(BaseModel):
    permissions: List[str]

class RolePermissionResponse(BaseModel):
    id: int
    organization_id: int
    role_name: str
    permissions: List[str]
    
    model_config = ConfigDict(from_attributes=True)
