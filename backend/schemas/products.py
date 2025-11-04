from pydantic import BaseModel
from typing import List

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