from backend.db.models import CampaignStatus
from typing import Optional
from pydantic import BaseModel
from datetime import date

class CampaignOut(BaseModel):
    id_campaign: int
    name: str
    product: str
    status: CampaignStatus
    start_date: date
    end_date: date

    class Config:
        from_atributes = True


class CampaignCreate(BaseModel):
    name: str
    id_product: int
    start_date: date
    end_date: date

class AdminCampaignOut(BaseModel):
    id_campaign: int
    name: str
    status: CampaignStatus
    start_date: date
    end_date: date
    product_name: str
    client_name: str
    client_email: str

    class Config:
        from_attributes = True

class AdminCampaignUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[CampaignStatus] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None