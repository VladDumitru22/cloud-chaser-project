from sqlalchemy.orm import declarative_base

Base = declarative_base()

from backend.db.models.user import User
from backend.db.models.product import Product
from backend.db.models.campaign import Campaign
from backend.db.models.component import Component
from backend.db.models.subscription import Subscription
