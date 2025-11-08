from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.core import get_current_user
from backend.functions import get_user_campaigns
from backend.schemas import CampaignOut, CampaignCreate
from backend.db.models import Campaign, Subscription, SubscriptionStatus, CampaignStatus

router = APIRouter(tags=["Campaigns"])

@router.get("/", response_model=list[CampaignOut])
def get_campaigns_for_current_user(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    campaigns = get_user_campaigns(db=db, user_id=current_user.id_user)

    result = []
    for c in campaigns:
        result.append(
            CampaignOut(
                id_campaign=c.id_campaign,
                name=c.name,
                product=c.subscription.product.name,
                status=c.status,
                start_date=c.start_date,
                end_date=c.end_date
            )
        )
    return result

@router.post("/", response_model=CampaignOut)
def create_campaign(
    campaign_data: CampaignCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    
    subscription = db.query(Subscription).filter(
        Subscription.id_user == current_user.id_user,
        Subscription.id_product == campaign_data.id_product,
        Subscription.status == SubscriptionStatus.Active
    ).first()

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active subscription for this product not found."
        )

    db_campaign = Campaign(
        id_subscription=subscription.id_subscription,
        name=campaign_data.name,
        start_date=campaign_data.start_date,
        end_date=campaign_data.end_date,
        status=CampaignStatus.Pending,
    )
    
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    
    product_name = subscription.product.name if subscription.product else "Unknown Product"
    
    return CampaignOut(
        id_campaign=db_campaign.id_campaign,
        name=db_campaign.name,
        product=product_name,
        status=db_campaign.status,
        start_date=db_campaign.start_date,
        end_date=db_campaign.end_date
    )