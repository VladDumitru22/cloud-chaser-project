from sqlalchemy import (
    Integer, Column, ForeignKey
)
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import relationship
from ..base import Base

class ProductComponent(Base):
    __tablename__ = 'products_components'
    id_product = Column(BIGINT(unsigned=True), ForeignKey("products.id_product", name="fk_products_components_products", ondelete="CASCADE"), primary_key=True, nullable=False)
    id_component = Column(BIGINT(unsigned=True), ForeignKey("components.id_component", name="fk_products_components_component", ondelete="CASCADE"), primary_key=True, nullable=False)
    quantity = Column(Integer, nullable=False)

    product = relationship("Product", back_populates="components_association")
    component = relationship("Component", back_populates="products_association")
