from sqlalchemy import (
    Column, Integer, String, Enum, TIMESTAMP, DECIMAL,
    Boolean, Date, ForeignKey, Text, CheckConstraint
)
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
from sqlalchemy.dialects.mysql import BIGINT
import enum

Base = declarative_base()

class UserRole(str, enum.Enum):
    CLIENT = "CLIENT"
    OPERATIVE = "OPERATIVE"
    ADMIN = "ADMIN"

class SubscriptionStatus(str, enum.Enum):
    Active = "Active"
    Cancelled = "Cancelled"
    Expired = "Expired"

class CampaignStatus(str, enum.Enum):
    Pending = "Pending"
    Active = "Active"
    Completed = "Completed"
    On_Hold = "On Hold"

class User(Base):
    __tablename__ = 'users'
    id_user = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.CLIENT)    
    phone_number = Column(String(20), nullable=True)
    address = Column(String(200), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    last_login_at = Column(TIMESTAMP, nullable=True)
    
    subscriptions = relationship("Subscription", back_populates="user")

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

class Product(Base):
    __tablename__ = 'products'
    id_product = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    monthly_price = Column(DECIMAL(19, 4), nullable=False)
    is_active = Column(Boolean, default=True)

    subscriptions = relationship("Subscription", back_populates="product")
    components_association = relationship("ProductComponent", back_populates="product") 
    components = relationship("Component", secondary="products_components", back_populates="products")

class ProductComponent(Base):
    __tablename__ = 'products_components'
    id_product = Column(BIGINT(unsigned=True), ForeignKey("products.id_product", name="fk_products_components_products", ondelete="CASCADE"), primary_key=True, nullable=False)
    id_component = Column(BIGINT(unsigned=True), ForeignKey("components.id_component", name="fk_products_components_component", ondelete="CASCADE"), primary_key=True, nullable=False)
    quantity = Column(Integer, nullable=False)

    product = relationship("Product", back_populates="components_association")
    component = relationship("Component", back_populates="products_association")

class Component(Base):
    __tablename__ = 'components'
    id_component = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True, nullable=False)
    name = Column(String(100), nullable=False)
    component_type = Column(String(50), nullable=False)
    unit_cost = Column(DECIMAL(19, 4), nullable=False)
    description = Column(String(255), nullable=True)
    
    products_association = relationship("ProductComponent", back_populates="component")
    products = relationship("Product", secondary="products_components", back_populates="components")
