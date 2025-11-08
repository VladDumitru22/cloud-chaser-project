from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.db.models import ProductComponent
from backend.schemas import PackageUpdate, PackageOut, PackageCreate
from backend.core import operative_required
from typing import List

router = APIRouter(
    tags=["Packages Management (Operative)"],
    dependencies=[Depends(operative_required)]
)

@router.get("/", response_model=List[PackageOut])
def get_all_packages(db: Session = Depends(get_db)):
    packages = db.query(ProductComponent).all()
    result = []
    for pkg in packages:
        result.append(PackageOut(
            id_product=pkg.id_product,
            id_component=pkg.id_component,
            quantity=pkg.quantity,
            product_name=pkg.product.name if pkg.product else "Unknown",
            component_name=pkg.component.name if pkg.component else "Unknown"
        ))
    return result

@router.post("/", response_model=PackageOut)
def create_package_link(
    package_data: PackageCreate,
    db: Session = Depends(get_db)
):
    existing_link = db.query(ProductComponent).filter(
        ProductComponent.id_product == package_data.id_product,
        ProductComponent.id_component == package_data.id_component
    ).first()
    
    if existing_link:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This component is already linked to this product."
        )

    db_package = ProductComponent(
        id_product=package_data.id_product,
        id_component=package_data.id_component,
        quantity=package_data.quantity
    )
    db.add(db_package)
    db.commit()
    db.refresh(db_package)
    
    return PackageOut(
        id_product=db_package.id_product,
        id_component=db_package.id_component,
        quantity=db_package.quantity,
        product_name=db_package.product.name if db_package.product else "Unknown",
        component_name=db_package.component.name if db_package.component else "Unknown"
    )

@router.put("/{product_id}/{component_id}", response_model=PackageOut)
def update_package_link(
    product_id: int,
    component_id: int,
    package_data: PackageUpdate,
    db: Session = Depends(get_db)
):
    db_package = db.query(ProductComponent).filter(
        ProductComponent.id_product == product_id,
        ProductComponent.id_component == component_id
    ).first()
    
    if not db_package:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package link not found")
        
    db_package.quantity = package_data.quantity
    db.commit()
    db.refresh(db_package)
    
    return PackageOut(
        id_product=db_package.id_product,
        id_component=db_package.id_component,
        quantity=db_package.quantity,
        product_name=db_package.product.name if db_package.product else "Unknown",
        component_name=db_package.component.name if db_package.component else "Unknown"
    )

@router.delete("/{product_id}/{component_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_package_link(
    product_id: int,
    component_id: int,
    db: Session = Depends(get_db)
):
    db_package = db.query(ProductComponent).filter(
        ProductComponent.id_product == product_id,
        ProductComponent.id_component == component_id
    ).first()
    
    if not db_package:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package link not found")
        
    db.delete(db_package)
    db.commit()
    return