from backend.db.models import CampaignStatus
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