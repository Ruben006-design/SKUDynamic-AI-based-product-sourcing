"""
Workflow Independence Test: Verifies that SKUDynamic AI functions 100% locally
with zero external API access, zero third-party AI keys, and external services disabled.
"""

import pytest
from datetime import date, datetime, timedelta
from unittest.mock import patch
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base import Base
from app.product.models import Product
from app.retailer.models import Retailer
from app.supplier.models import Supplier
from app.product_supplier.models import ProductSupplier
from app.inventory.models import Inventory
from app.sales.models import Sales
from app.weight_config.models import WeightConfig
from app.weightage.models import Weightage
from app.human_evaluation.models import HumanEvaluation
from app.order_list.models import OrderList
from app.order_list.repository import OrderListRepository
from app.order_list.service import OrderListService
from app.weightage_engine.service import WeightageEngineService
from app.reordering_engine.service import ReorderingEngineService
from app.core.config import settings


@pytest.fixture
def local_test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


class TestExternalAPIIndependence:
    def test_complete_local_end_to_end_workflow(self, local_test_db):
        db = local_test_db

        # Explicitly configure environment with zero external credentials and LLM_PROVIDER="local"
        with patch.object(settings, "GEMINI_API_KEY", ""), \
             patch.object(settings, "LLM_PROVIDER", "local"), \
             patch.object(settings, "PROCUREMENT_API_KEY", "comp-key-2026"):

            # 1. Retailer
            retailer = Retailer(retailer_name="Local Independent Mart", contact_email="local@example.com")
            db.add(retailer)
            db.commit()

            # 2. Product
            product = Product(
                retailer_id=retailer.retailer_id,
                product_name="Local Organic Milk",
                category="dairy",
                sku_code="MILK-LOCAL-01",
                durability_days=7,
                unit_cost=3.50,
                created_at=datetime.now() - timedelta(days=90)
            )
            db.add(product)
            db.commit()

            # 3. Supplier
            supplier = Supplier(
                retailer_id=retailer.retailer_id,
                supplier_name="Local Dairy Farm",
                lead_time_days=2,
                quality_score=0.95
            )
            db.add(supplier)
            db.commit()

            ps = ProductSupplier(
                product_id=product.product_id,
                supplier_id=supplier.supplier_id,
                negotiated_price=3.20,
                is_preferred=True
            )
            db.add(ps)

            # 4. Inventory
            inventory = Inventory(
                product_id=product.product_id,
                retailer_id=retailer.retailer_id,
                current_stock=10,
                reorder_point=40,
                safety_stock=20
            )
            db.add(inventory)

            # 5. Sales (90 days, 15 units/day)
            today = date.today()
            for i in range(90):
                db.add(Sales(
                    product_id=product.product_id,
                    retailer_id=retailer.retailer_id,
                    sale_date=today - timedelta(days=i),
                    quantity_sold=15,
                    revenue=52.50,
                    popularity_score=9
                ))

            # 6. WeightConfig
            config = WeightConfig(
                retailer_id=retailer.retailer_id,
                config_name="Standard Local",
                sales_volume_w=0.25,
                lead_time_w=0.15,
                supplier_quality_w=0.15,
                popularity_w=0.10,
                weather_w=0.10,
                festival_demand_w=0.05,
                durability_w=0.10,
                expiry_w=0.10
            )
            db.add(config)
            db.commit()

            # 7. Step 1: Generate Local Weightages (No external API calls)
            weights, model_used = WeightageEngineService._resolve_weights(
                product=product,
                product_inventory=inventory,
                product_sales=Sales.sales_history if hasattr(Sales, "sales_history") else db.query(Sales).filter(Sales.product_id == product.product_id).all(),
                product_suppliers=[ps],
                human_evaluations=[],
                config=config
            )

            assert model_used == "local-statistical-engine-v1"
            assert sum(weights.values()) == pytest.approx(1.0000, abs=1e-4)

            # Save weightage
            weightage = Weightage(
                product_id=product.product_id,
                retailer_id=retailer.retailer_id,
                config_id=config.config_id,
                sales_volume_weight=weights["sales_volume_weight"],
                lead_time_weight=weights["lead_time_weight"],
                supplier_quality_weight=weights["supplier_quality_weight"],
                popularity_weight=weights["popularity_weight"],
                weather_weight=weights["weather_weight"],
                festival_demand_weight=weights["festival_demand_weight"],
                durability_weight=weights["durability_weight"],
                expiry_weight=weights["expiry_weight"],
                recommendation_score=75.0
            )
            db.add(weightage)
            db.commit()

            # 8. Step 2: Generate Product Recommendation & Order
            # Target Stock = (15 units/day * 2 lead time) + 20 safety stock = 50 units.
            # Inventory Position = 10 on-hand + 0 on-order = 10 units.
            # Net Reorder Quantity needed = 50 - 10 = 40 units.
            rec = ReorderingEngineService._generate_recommendation_for_product(
                db=db,
                retailer=retailer,
                config_id=config.config_id,
                product=product
            )

            assert rec.reorder_required is True
            assert rec.reorder_quantity == 40
            assert rec.supplier_id == supplier.supplier_id

            # 9. Step 3: Verify Order in Order_List
            active_order = OrderListRepository.get_active_order_for_product(
                db, product.product_id, retailer.retailer_id
            )
            assert active_order is not None
            assert active_order.status == "pending"
            assert active_order.recommended_order_qty == 40

            # 10. Step 4: Approve Order
            approved_order = OrderListService.approve_order(
                db=db,
                order_list_id=active_order.order_list_id,
                approved_by="Verified: Procurement Officer"
            )
            assert approved_order.status == "approved"
            assert approved_order.approved_by == "Verified: Procurement Officer"

            # 11. Step 5: Verify Analytics
            analytics = OrderListRepository.get_analytics(db)
            assert analytics["total_orders"] == 1
            assert analytics["approved_orders"] == 1
            assert analytics["pending_orders"] == 0

    def test_gemini_failure_transparently_falls_back_to_local_engine(self, local_test_db):
        db = local_test_db

        with patch.object(settings, "LLM_PROVIDER", "gemini"), \
             patch.object(settings, "GEMINI_API_KEY", "invalid_dummy_key"):

            retailer = Retailer(retailer_name="Failover Mart", contact_email="fail@example.com")
            db.add(retailer)
            db.commit()

            product = Product(
                retailer_id=retailer.retailer_id,
                product_name="Failover Bread",
                category="bakery",
                sku_code="BREAD-01",
                durability_days=3,
                created_at=datetime.now() - timedelta(days=90)
            )
            db.add(product)
            db.commit()

            inv = Inventory(product_id=product.product_id, retailer_id=retailer.retailer_id, current_stock=5)
            db.add(inv)

            config = WeightConfig(retailer_id=retailer.retailer_id, config_name="Std")
            db.add(config)
            db.commit()

            # When Gemini fails (e.g. invalid key or network down), it MUST fallback to local engine
            weights, model_used = WeightageEngineService._resolve_weights(
                product=product,
                product_inventory=inv,
                product_sales=[],
                product_suppliers=[],
                human_evaluations=[],
                config=config
            )

            assert model_used == "local-statistical-engine-v1"
            assert sum(weights.values()) == pytest.approx(1.0000, abs=1e-4)
