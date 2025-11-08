from fastapi import APIRouter, Depends
from backend.core import get_current_user
from backend.schemas import UserOut

router = APIRouter(tags=["Users"])

@router.get("/me", response_model=UserOut)
def read_current_user(current_user = Depends(get_current_user)):
    return current_user
    