from sqlalchemy import Column, String, Text, DECIMAL, Boolean
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import relationship
from ..base import Base

class Product(Base):
    __tablename__ = 'products'
    id_product = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    monthly_price = Column(DECIMAL(19, 4), nullable=False)
    is_active = Column(Boolean, default=True)

    subscriptions = relationship("Subscription", back_populates="product")
    components_association = relationship("ProductComponent", back_populates="product") 
