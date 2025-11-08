from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.core import operative_required
from backend.db.models import Product
from backend.schemas import ProductMgmtOut, ProductMgmtUpdate
from typing import List

router = APIRouter(
    tags=["Products Management (Operative)"],
    dependencies=[Depends(operative_required)]
)

@router.get("/", response_model=List[ProductMgmtOut])
def get_all_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return products

@router.post("/", response_model=ProductMgmtOut, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: ProductMgmtUpdate,
    db: Session = Depends(get_db)
):
    db_product = Product(
        name=product_data.name,
        description=product_data.description,
        monthly_price=product_data.monthly_price,
        is_active=product_data.is_active
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.put("/{product_id}", response_model=ProductMgmtOut)
def update_product(
    product_id: int,
    product_data: ProductMgmtUpdate,
    db: Session = Depends(get_db)
):
    db_product = db.query(Product).filter(Product.id_product == product_id).first()
    if not db_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    update_data = product_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id_product == product_id).first()
    if not db_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    db.delete(db_product)
    db.commit()
    return