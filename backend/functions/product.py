from sqlalchemy.orm import Session
from backend.db.models import Product

def get_products_id_name(db: Session):
    products = (
        db.query(Product)
        .filter(Product.is_active == True)
        .all()
    )
    return products