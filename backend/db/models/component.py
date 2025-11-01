from sqlalchemy import (
    Column, String, DECIMAL
)
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import relationship
from ..base import Base

class Component(Base):
    __tablename__ = 'components'
    id_component = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True, nullable=False)
    name = Column(String(100), nullable=False)
    component_type = Column(String(50), nullable=False)
    unit_cost = Column(DECIMAL(19, 4), nullable=False)
    description = Column(String(255), nullable=True)
    
    products_association = relationship("ProductComponent", back_populates="component")
    products = relationship("Product", secondary="products_components", back_populates="components")
