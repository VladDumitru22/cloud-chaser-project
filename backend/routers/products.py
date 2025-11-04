from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.functions import get_products_id_name
from backend.schemas import ProductDropDown

router = APIRouter(tags=["products"])

@router.get("/drop_down", response_model=list[ProductDropDown])
def get_products_for_drop_down(db: Session = Depends(get_db)):
    products = get_products_id_name(db=db)

    result = []
    for p in products:
        result.append(
            ProductDropDown(
                id_product=p.id_product,
                name=p.name
            )
        )
    return result