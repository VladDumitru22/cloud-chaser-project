from backend.db.models import CampaignStatus
from pydantic import BaseModel
from datetime import date

class CampaignOut(BaseModel):
    name: str
    product: str
    status: CampaignStatus
    start_date: date
    end_date: date