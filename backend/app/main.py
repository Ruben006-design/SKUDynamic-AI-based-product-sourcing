from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.utils.logger import logger
from app.core.config import settings
from app.database.base import Base
from app.database.database import engine
from app.exceptions.exception_handlers import register_exception_handlers

from app.retailer.models import Retailer
from app.product.models import Product
from app.supplier.models import Supplier
from app.product_supplier.models import ProductSupplier
from app.inventory.models import Inventory
from app.sales.models import Sales
from app.weight_config.models import WeightConfig
from app.weightage.models import Weightage
from app.human_evaluation.models import HumanEvaluation
from app.order_list.models import OrderList
from app.retailer.router import router as retailer_router
from app.product.router import router as product_router
from app.supplier.router import router as supplier_router
from app.product_supplier.router import router as product_supplier_router
from app.inventory.router import router as inventory_router
from app.sales.router import router as sales_router
from app.weight_config.router import router as weight_config_router
from app.weightage.router import router as weightage_router
from app.human_evaluation.router import router as human_evaluation_router
from app.order_list.router import router as order_list_router
from app.health.router import router as health_router
from app.weightage_engine.router import (
    router as weightage_engine_router
)
from app.reordering_engine.router import router as reordering_router
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
logger.info("Starting Data Ingestion Service...")
app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

Base.metadata.create_all(bind=engine)

# Register routers
app.include_router(retailer_router)
app.include_router(product_router)
app.include_router(supplier_router)
app.include_router(product_supplier_router)
app.include_router(inventory_router)
app.include_router(weight_config_router)
app.include_router(order_list_router)
app.include_router(weightage_router)
app.include_router(sales_router)
app.include_router(human_evaluation_router)
app.include_router(health_router)
app.include_router(weightage_engine_router)
app.include_router(reordering_router)
@app.get("/")
def root():
    return {
        "message": settings.APP_NAME,
        "database": settings.DB_NAME
    }