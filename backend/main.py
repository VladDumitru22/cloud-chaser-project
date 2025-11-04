from backend.routers import (
    auth_router, 
    campaign_router, 
    user_router,
    product_router,
    subscription_router,
)
from fastapi.middleware.cors import CORSMiddleware
from backend.db.session import engine
from backend.db.base import Base
from fastapi import FastAPI

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Cloud Chaser API")

origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(user_router, prefix="/users")
app.include_router(campaign_router, prefix="/campaigns")
app.include_router(product_router, prefix="/products")
app.include_router(subscription_router, prefix="/subscriptions")