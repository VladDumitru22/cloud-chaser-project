from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

class ComponentOut(BaseModel):
    id_component: int
    name: str
    component_type: str
    unit_cost: Decimal
    description: Optional[str] = None

    class Config:
        from_attributes = True

class ComponentCreate(BaseModel):
    name: str
    component_type: str
    unit_cost: Decimal
    description: Optional[str] = None

class ComponentUpdate(BaseModel):
    name: Optional[str] = None
    component_type: Optional[str] = None
    unit_cost: Optional[Decimal] = None
    description: Optional[str] = None