from sqlalchemy.orm import Session
from passlib.context import CryptContext
from backend.utils import validate_password
from backend.schemas import UserCreate
from backend.db.models import User


pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def create_user(db: Session, user: UserCreate):
    validate_password(user.password)
    normalized_email = user.email.lower()
    hashed_password = pwd_context.hash(user.password)
    db_user = User(
        name=user.name,
        email=normalized_email,
        password_hash=hashed_password,
        phone_number=user.phone_number,
        address=user.address,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email):
    normalized_email = email.lower()
    return db.query(User).filter(User.email == normalized_email).first()

def get_user_by_id(db: Session, id):
    return db.query(User).filter(User.id_user == id).first()