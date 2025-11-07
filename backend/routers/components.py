# În routers/components.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.db.models import Component
from backend.schemas import ComponentUpdate, ComponentOut, ComponentCreate
from backend.db.session import get_db
from backend.core import operative_required

router = APIRouter(
    tags=["components"],
    dependencies=[Depends(operative_required)]
)

@router.get("/", response_model=List[ComponentOut])
def get_all_components(db: Session = Depends(get_db)):
    """
    Obține o listă cu toate componentele.
    """
    components = db.query(Component).all()
    return components


@router.post("/", response_model=ComponentOut, status_code=status.HTTP_201_CREATED)
def create_component(
    component_data: ComponentCreate,
    db: Session = Depends(get_db)
):

    db_component = Component(**component_data.model_dump())
    db.add(db_component)
    db.commit()
    db.refresh(db_component)
    return db_component

@router.put("/{component_id}", response_model=ComponentOut)
def update_component(
    component_id: int,
    component_data: ComponentUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualizează o componentă.
    """
    db_component = db.query(Component).filter(Component.id_component == component_id).first()
    if not db_component:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Component not found")
    
    update_data = component_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_component, key, value)
    
    db.commit()
    db.refresh(db_component)
    return db_component

@router.delete("/{component_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_component(component_id: int, db: Session = Depends(get_db)):
    """
    Șterge o componentă.
    """
    db_component = db.query(Component).filter(Component.id_component == component_id).first()
    if not db_component:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Component not found")
    
    db.delete(db_component)
    db.commit()
    return