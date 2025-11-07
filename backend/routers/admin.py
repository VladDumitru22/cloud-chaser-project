from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.db.models import User, Subscription, Campaign
from passlib.context import CryptContext
from backend.schemas import UserOut, ClientCreate, ClientUpdate, AdminCampaignUpdate, AdminCampaignOut
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


@router.get("/campaigns", response_model=List[AdminCampaignOut])
def get_all_campaigns(db: Session = Depends(get_db)):
    campaigns = db.query(Campaign).all()
    
    result = []
    for c in campaigns:
        product_name = "Unknown"
        client_name = "Unknown"
        client_email = "Unknown"
        
        if c.subscription:
            if c.subscription.product:
                product_name = c.subscription.product.name
            if c.subscription.user:
                client_name = c.subscription.user.name
                client_email = c.subscription.user.email

        result.append(AdminCampaignOut(
            id_campaign=c.id_campaign,
            name=c.name,
            status=c.status,
            start_date=c.start_date,
            end_date=c.end_date,
            product_name=product_name,
            client_name=client_name,
            client_email=client_email
        ))
    return result

@router.put("/campaigns/{campaign_id}", response_model=AdminCampaignOut)
def update_campaign(
    campaign_id: int,
    campaign_data: AdminCampaignUpdate,
    db: Session = Depends(get_db)
):
    db_campaign = db.query(Campaign).filter(Campaign.id_campaign == campaign_id).first()
    if not db_campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    
    update_data = campaign_data.model_dump(exclude_unset=True)

    if "status" in update_data:
        if update_data["status"] == "On_Hold":
            update_data["status"] = "On Hold"

    for key, value in update_data.items():
        setattr(db_campaign, key, value)
    
    db.commit()
    db.refresh(db_campaign)
    
    product_name = db_campaign.subscription.product.name if db_campaign.subscription and db_campaign.subscription.product else "Unknown"
    client_name = db_campaign.subscription.user.name if db_campaign.subscription and db_campaign.subscription.user else "Unknown"
    client_email = db_campaign.subscription.user.email if db_campaign.subscription and db_campaign.subscription.user else "Unknown"

    return AdminCampaignOut(
        id_campaign=db_campaign.id_campaign,
        name=db_campaign.name,
        status=db_campaign.status,
        start_date=db_campaign.start_date,
        end_date=db_campaign.end_date,
        product_name=product_name,
        client_name=client_name,
        client_email=client_email
    )

@router.delete("/campaigns/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_campaign(campaign_id: int, db: Session = Depends(get_db)):

    db_campaign = db.query(Campaign).filter(Campaign.id_campaign == campaign_id).first()
    if not db_campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    
    db.delete(db_campaign)
    db.commit()
    return