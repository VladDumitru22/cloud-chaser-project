from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.db.models import User, Subscription
from passlib.context import CryptContext
from backend.schemas import UserOut, ClientCreate, ClientUpdate
from backend.db.session import get_db
from backend.core import admin_required
from typing import List

router = APIRouter(tags=["admin"], dependencies=[Depends(admin_required)])
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

@router.get("/clients", response_model=List[UserOut])
def get_all_clients(db: Session = Depends(get_db)):
    clients = db.query(User).filter(
        User.role.in_(["CLIENT", "OPERATIVE"])
    ).all()
    return clients

@router.post("/clients", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_client(
    client_data: ClientCreate,
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(User.email == client_data.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    hashed_password = pwd_context.hash(client_data.password)
    db_user = User(
        email=client_data.email,
        name=client_data.name,
        password_hash=hashed_password,
        phone_number=client_data.phone_number,
        address=client_data.address,
        role=client_data.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.put("/clients/{user_id}", response_model=UserOut)
def update_client(
    user_id: int,
    client_data: ClientUpdate,
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(User.id_user == user_id).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    update_data = client_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/clients/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id_user == user_id).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    db.query(Subscription).filter(Subscription.id_user == user_id).delete(synchronize_session=False)
    
    db.delete(db_user)
    db.commit()