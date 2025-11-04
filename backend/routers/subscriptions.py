from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.core import get_current_user
from backend.db.models import Subscription, SubscriptionStatus
from backend.schemas import SubscriptionOut, SubscriptionCreate
from datetime import date
from typing import List

router = APIRouter(tags=["subscriptions"])

@router.post("/", response_model=SubscriptionOut)
def create_subscription(
    sub_data: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    existing_sub = db.query(Subscription).filter(
        Subscription.id_user == current_user.id_user,
        Subscription.id_product == sub_data.id_product,
        Subscription.status == SubscriptionStatus.Active
    ).first()

    if existing_sub:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have an active subscription for this product."
        )

    db_sub = Subscription(
        id_user=current_user.id_user,
        id_product=sub_data.id_product,
        status=SubscriptionStatus.Active,
        start_date=date.today()
    )
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)
    
    return db_sub

@router.get("/my-active-ids", response_model=List[int])
def get_my_active_subscription_ids(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    active_subs = db.query(Subscription.id_product).filter(
        Subscription.id_user == current_user.id_user,
        Subscription.status == SubscriptionStatus.Active
    ).all()
    
    return [sub[0] for sub in active_subs]