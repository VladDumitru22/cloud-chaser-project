from pydantic import BaseModel
from typing import List
from typing import Optional, List
from decimal import Decimal

class ComponentDetail(BaseModel):
    name: str
    quantity: int

class ProductDropDown(BaseModel):
    id_product: int
    name: str

class ProductCard(BaseModel):
    id_product: int
    name: str
    description: str
    monthly_price: float
    components: List[ComponentDetail]

    class Config:
        from_attributes = True

class ProductMgmtOut(BaseModel):
    id_product: int
    name: str
    description: Optional[str] = None
    monthly_price: Decimal
    is_active: bool

    class Config:
        from_attributes = True

class ProductMgmtCreate(BaseModel):
    name: str
    description: Optional[str] = None
    monthly_price: Decimal
    is_active: bool = True

class ProductMgmtUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    monthly_price: Optional[Decimal] = None
    is_active: Optional[bool] = None