from pydantic import BaseModel
from datetime import date
from backend.db.models import SubscriptionStatus


class SubscriptionCreate(BaseModel):
    id_product: int

class SubscriptionOut(BaseModel):
    id_subscription: int
    id_product: int
    id_user: int
    status: SubscriptionStatus
    start_date: date

    class Config:
        from_attributes = True