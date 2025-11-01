from sqlalchemy import (
    Column, String, Enum, Date, 
    CheckConstraint,ForeignKey
)
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import relationship
from ..base import Base
import enum

class CampaignStatus(str, enum.Enum):
    Pending = "Pending"
    Active = "Active"
    Completed = "Completed"
    On_Hold = "On Hold"

class Campaign(Base):
    __tablename__ = 'campaigns'
    id_campaign = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True, nullable=False)
    id_subscription = Column(BIGINT(unsigned=True), ForeignKey("subscriptions.id_subscription", name="fk_campaign_subscription", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    status = Column(Enum(CampaignStatus), nullable=False, default=CampaignStatus.Pending)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    subscription = relationship("Subscription", back_populates="campaigns")
    __table_args__ = (
        CheckConstraint('start_date <= end_date', name='chk_campaign_dates'),
    )
