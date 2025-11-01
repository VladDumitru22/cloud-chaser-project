from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import crud, models, schemas, auth
from database import engine, get_db
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Cloud Chaser API")

@app.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def create_new_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    try:
        created = crud.create_user(db=db, user=user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    return created

@app.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    email_normalized = form_data.username.lower()
    user = crud.get_user_by_email(db, email=email_normalized)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token_data = {"id_user": user.id_user, "role": user.role.value}
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(data=token_data, 
                                            expires_delta=access_token_expires)

    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.UserOut)
def read_current_user(current_user = Depends(auth.get_current_user)):
    return current_user