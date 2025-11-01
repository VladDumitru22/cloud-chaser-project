from sqlalchemy import (
    Column, Date, Enum, ForeignKey
)
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import relationship
from ..base import Base
import enum

class SubscriptionStatus(str, enum.Enum):
    Active = "Active"
    Cancelled = "Cancelled"
    Expired = "Expired"

class Subscription(Base):
    __tablename__ = 'subscriptions'
    id_subscription = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True, nullable=False)
    id_user = Column(BIGINT(unsigned=True), ForeignKey("users.id_user", name="fk_subscription_user", ondelete="CASCADE"), nullable=False)
    id_product = Column(BIGINT(unsigned=True), ForeignKey("products.id_product", name="fk_subscription_products", ondelete="RESTRICT"), nullable=False)
    status = Column(Enum(SubscriptionStatus), nullable=False, default=SubscriptionStatus.Active)    
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)

    user = relationship("User", back_populates="subscriptions")
    product = relationship("Product", back_populates="subscriptions")
    campaigns = relationship("Campaign", back_populates="subscription")

