from sqlalchemy.orm import Session
import models, schemas, restrictions
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def create_user(db: Session, user: schemas.UserCreate):
    restrictions.validate_password(user.password)
    normalized_email = user.email.lower()
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(
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
    return db.query(models.User).filter(models.User.email == normalized_email).first()