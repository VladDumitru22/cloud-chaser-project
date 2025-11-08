from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.functions import get_active_products
from backend.schemas import ProductDropDown, ProductCard, ComponentDetail
from typing import List
from backend.db.models import Product


router = APIRouter(tags=["Products"])

@router.get("/drop_down", response_model=list[ProductDropDown])
def get_products_for_drop_down(db: Session = Depends(get_db)):
    products = get_active_products(db=db)
    return [
        ProductDropDown(id_product=p.id_product, name=p.name)
        for p in products
    ]  

@router.get("/list", response_model=List[ProductCard])
def get_all_products(db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.is_active == True).all()
    
    result = []
    for p in products:
        component_list = []

        for pc in p.components_association: 
            component_list.append(ComponentDetail(
                name=pc.component.name,
                quantity=pc.quantity
            ))
            
        result.append(ProductCard(
            id_product=p.id_product,
            name=p.name,
            description=p.description,
            monthly_price=p.monthly_price,
            components=component_list
        ))
    return result