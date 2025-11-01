from pydantic import BaseModel, field_serializer
from backend.db.models import CampaignStatus
from datetime import date
from backend.utils import format_date

class CampaignOut(BaseModel):
    name: str
    product: str
    status: CampaignStatus
    start_date: date
    end_date: date

    @field_serializer("start_date", "end_date")
    def format_dates(self, v: date):
        return format_date(v)

