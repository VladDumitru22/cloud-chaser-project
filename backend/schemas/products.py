from backend.db.models import Product
from pydantic import BaseModel

class ProductDropDown(BaseModel):
    id_product: int
    name: str