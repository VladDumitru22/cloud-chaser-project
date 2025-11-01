from sqlalchemy.orm import Session, joinedload
from backend.db.models import Campaign, Subscription, Product

def get_user_campaigns(db: Session, user_id: int):
    campaigns = (
        db.query(Campaign)
        .join(Subscription, Campaign.id_subscription == Subscription.id_subscription)
        .join(Product, Subscription.id_product == Product.id_product)
        .filter(Subscription.id_user == user_id)
        .options(
            joinedload(Campaign.subscription).joinedload(Subscription.product)
        )
        .all()
    )
    return campaigns

