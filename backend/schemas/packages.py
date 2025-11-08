from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal

class PackageOut(BaseModel):
    id_product: int
    id_component: int
    quantity: int
    product_name: str
    component_name: str

    class Config:
        from_attributes = True

class PackageCreate(BaseModel):
    id_product: int
    id_component: int
    quantity: int

class PackageUpdate(BaseModel):
    quantity: int