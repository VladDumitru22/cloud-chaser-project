from sqlalchemy import Column, String, Enum, TIMESTAMP
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..base import Base
import enum

class UserRole(str, enum.Enum):
    CLIENT = "CLIENT"
    OPERATIVE = "OPERATIVE"
    ADMIN = "ADMIN"

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
