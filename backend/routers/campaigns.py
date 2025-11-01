from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.core import get_current_user
from backend.functions import get_user_campaigns
from backend.schemas import CampaignOut

router = APIRouter(tags=["campaigns"])

@router.get("/", response_model=list[CampaignOut])
def get_campaigns_for_current_user(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    campaigns = get_user_campaigns(db=db, user_id=current_user.id_user)

    result = []
    for c in campaigns:
        result.append(
            CampaignOut(
                name=c.name,
                product=c.subscription.product.name,
                status=c.status,
                start_date=c.start_date,
                end_date=c.end_date
            )
        )
    return result