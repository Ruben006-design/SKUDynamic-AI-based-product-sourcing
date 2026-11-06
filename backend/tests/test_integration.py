"""
Integration tests for the complete SKUDynamic AI workflow:
- Recommendation generation using Inventory Position
- Reorder quantity calculation with On-Hand and On-Order stocks
- Active order handling and duplicate order prevention
- Multi-criteria supplier selection
- Order creation, approval, and rejection
- Real SQLite session persistence
"""

import pytest
from datetime import date, datetime, timedelta
from unittest.mock import MagicMock
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
from app.reordering_engine.service import ReorderingEngineService
from app.reordering_engine.recommendation_engine import RecommendationEngine
from app.reordering_engine.supplier_selector import SupplierSelector


@pytest.fixture
def in_memory_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


class TestEndToEndWorkflowIntegration:
    def test_complete_reorder_and_approval_flow(self, in_memory_db):
        db = in_memory_db

        # 1. Create Retailer
        retailer = Retailer(
            retailer_name="Metro Retail",
            contact_email="metro@example.com"
        )
        db.add(retailer)
        db.commit()

        # 2. Create Product (created 90 days ago)
        product = Product(
            retailer_id=retailer.retailer_id,
            product_name="Premium Basmati Rice",
            category="food staples",
            sku_code="RICE-001",
            durability_days=365,
            unit_cost=50.0,
            created_at=datetime.now() - timedelta(days=90)
        )
        db.add(product)
        db.commit()

        # 3. Create Suppliers
        supplier1 = Supplier(
            retailer_id=retailer.retailer_id,
            supplier_name="Fast Supply Co",
            lead_time_days=5,
            quality_score=0.92
        )
        supplier2 = Supplier(
            retailer_id=retailer.retailer_id,
            supplier_name="Slow Cheap Co",
            lead_time_days=25,
            quality_score=0.60
        )
        db.add_all([supplier1, supplier2])
        db.commit()

        # Link product to suppliers
        ps1 = ProductSupplier(
            product_id=product.product_id,
            supplier_id=supplier1.supplier_id,
            negotiated_price=48.0,
            is_preferred=True
        )
        ps2 = ProductSupplier(
            product_id=product.product_id,
            supplier_id=supplier2.supplier_id,
            negotiated_price=45.0,
            is_preferred=False
        )
        db.add_all([ps1, ps2])

        # 4. Create Inventory: Low stock (breached reorder point)
        inv = Inventory(
            product_id=product.product_id,
            retailer_id=retailer.retailer_id,
            current_stock=10,
            reorder_point=25,
            safety_stock=20
        )
        db.add(inv)

        # 5. Create Sales: 10 units/day over last 90 days
        today = date.today()
        for i in range(90):
            s = Sales(
                product_id=product.product_id,
                retailer_id=retailer.retailer_id,
                sale_date=today - timedelta(days=i),
                quantity_sold=10,
                popularity_score=8
            )
            db.add(s)

        # 6. Create WeightConfig & Weightage
        config = WeightConfig(
            retailer_id=retailer.retailer_id,
            config_name="Default Config",
            sales_volume_w=0.30,
            lead_time_w=0.15,
            supplier_quality_w=0.15,
            popularity_w=0.10,
            weather_w=0.05,
            festival_demand_w=0.05,
            durability_w=0.10,
            expiry_w=0.10
        )
        db.add(config)
        db.commit()

        weightage = Weightage(
            product_id=product.product_id,
            retailer_id=retailer.retailer_id,
            config_id=config.config_id,
            sales_volume_weight=0.30,
            lead_time_weight=0.15,
            supplier_quality_weight=0.15,
            popularity_weight=0.10,
            weather_weight=0.05,
            festival_demand_weight=0.05,
            durability_weight=0.10,
            expiry_weight=0.10,
            recommendation_score=72.5
        )
        db.add(weightage)
        db.commit()

        # 7. Execute Reordering Engine recommendation
        rec = ReorderingEngineService._generate_recommendation_for_product(
            db=db,
            retailer=retailer,
            config_id=config.config_id,
            product=product
        )

        # Expected daily demand = 10 units/day. Lead time = 5 days. Safety stock = 20.
        # Target stock = 10 * 5 + 20 = 70.
        # On-hand = 10. On-order = 0. Inventory position = 10.
        # Net reorder quantity = 70 - 10 = 60.
        assert rec.reorder_required is True
        assert rec.reorder_quantity == 60
        assert rec.supplier_id == supplier1.supplier_id  # Preferred supplier selected

        # 8. Check that Order was created in Order_List
        active_order = OrderListRepository.get_active_order_for_product(
            db, product.product_id, retailer.retailer_id
        )
        assert active_order is not None
        assert active_order.status == "pending"
        assert active_order.recommended_order_qty == 60

        # 9. Verify Duplicate Order Prevention:
        rec2 = ReorderingEngineService._generate_recommendation_for_product(
            db=db,
            retailer=retailer,
            config_id=config.config_id,
            product=product
        )
        all_orders = db.query(OrderList).filter_by(product_id=product.product_id).all()
        assert len(all_orders) == 1

        # 10. Approve Order
        approved_order = OrderListService.approve_order(
            db=db,
            order_list_id=active_order.order_list_id,
            approved_by="Inventory Manager"
        )
        assert approved_order.status == "approved"
        assert approved_order.approved_by == "Inventory Manager"
        assert approved_order.approved_at is not None

        # 11. Verify Analytics
        analytics = OrderListRepository.get_analytics(db)
        assert analytics["total_orders"] == 1
        assert analytics["approved_orders"] == 1
        assert analytics["pending_orders"] == 0

        # 12. Reject Flow on a separate order
        rejected_order = OrderListService.reject_order(
            db=db,
            order_list_id=active_order.order_list_id,
            approved_by="Auditor"
        )
        assert rejected_order.status == "rejected"
        assert rejected_order.approved_by == "Auditor"

    def test_existing_on_order_reduces_reorder_quantity(self, in_memory_db):
        db = in_memory_db

        retailer = Retailer(retailer_name="Fresh Mart", contact_email="fresh@example.com")
        db.add(retailer)
        db.commit()

        product = Product(
            retailer_id=retailer.retailer_id,
            product_name="Olive Oil",
            category="staples",
            sku_code="OIL-002",
            created_at=datetime.now() - timedelta(days=90)
        )
        db.add(product)
        db.commit()

        supplier = Supplier(
            retailer_id=retailer.retailer_id,
            supplier_name="Global Foods",
            lead_time_days=10,
            quality_score=0.90
        )
        db.add(supplier)
        db.commit()

        ps = ProductSupplier(
            product_id=product.product_id,
            supplier_id=supplier.supplier_id,
            negotiated_price=10.0,
            is_preferred=True
        )
        db.add(ps)

        # On-hand = 20, Safety stock = 10, Reorder point = 50
        inv = Inventory(
            product_id=product.product_id,
            retailer_id=retailer.retailer_id,
            current_stock=20,
            reorder_point=50,
            safety_stock=10
        )
        db.add(inv)

        # Sales: 5 units/day over 90 days
        today = date.today()
        for i in range(90):
            db.add(Sales(
                product_id=product.product_id,
                retailer_id=retailer.retailer_id,
                sale_date=today - timedelta(days=i),
                quantity_sold=5
            ))

        config = WeightConfig(
            retailer_id=retailer.retailer_id,
            config_name="Standard",
            sales_volume_w=0.30
        )
        db.add(config)
        db.commit()

        weightage = Weightage(
            product_id=product.product_id,
            retailer_id=retailer.retailer_id,
            config_id=config.config_id,
            sales_volume_weight=0.30,
            lead_time_weight=0.15,
            supplier_quality_weight=0.15,
            popularity_weight=0.10,
            weather_weight=0.05,
            festival_demand_weight=0.05,
            durability_weight=0.10,
            expiry_weight=0.10,
            recommendation_score=60.0
        )
        db.add(weightage)
        db.commit()

        # Existing ordered shipment in transit: 35 units
        existing_shipment = OrderList(
            product_id=product.product_id,
            weightage_id=weightage.weightage_id,
            retailer_id=retailer.retailer_id,
            recommended_order_qty=35,
            status="ordered"
        )
        db.add(existing_shipment)
        db.commit()

        # Target Stock = 5 units/day * 10 lead time + 10 safety stock = 60.
        # Inventory Position = On-hand (20) + On-order (35) = 55.
        # Net Reorder Quantity needed = 60 - 55 = 5 units.
        rec = ReorderingEngineService._generate_recommendation_for_product(
            db=db,
            retailer=retailer,
            config_id=config.config_id,
            product=product
        )

        assert rec.reorder_quantity == 5

    def test_high_on_hand_stock_yields_zero_reorder(self, in_memory_db):
        db = in_memory_db
        retailer = Retailer(retailer_name="Metro Retail", contact_email="m@example.com")
        db.add(retailer)
        db.commit()

        product = Product(
            retailer_id=retailer.retailer_id,
            product_name="Surplus Salt",
            category="staples",
            sku_code="SALT-01",
            created_at=datetime.now() - timedelta(days=90)
        )
        db.add(product)
        db.commit()

        # On hand 1000, safety 20, reorder point 50
        inv = Inventory(
            product_id=product.product_id,
            retailer_id=retailer.retailer_id,
            current_stock=1000,
            reorder_point=50,
            safety_stock=20
        )
        db.add(inv)

        config = WeightConfig(retailer_id=retailer.retailer_id, config_name="Standard")
        db.add(config)
        db.commit()

        weightage = Weightage(
            product_id=product.product_id,
            retailer_id=retailer.retailer_id,
            config_id=config.config_id,
            sales_volume_weight=0.2, lead_time_weight=0.1, supplier_quality_weight=0.1,
            popularity_weight=0.1, weather_weight=0.1, festival_demand_weight=0.1,
            durability_weight=0.15, expiry_weight=0.15,
            recommendation_score=30.0
        )
        db.add(weightage)
        db.commit()

        rec = ReorderingEngineService._generate_recommendation_for_product(
            db=db, retailer=retailer, config_id=config.config_id, product=product
        )
        assert rec.reorder_required is False
        assert rec.reorder_quantity == 0

        # Verify no order was inserted
        orders = db.query(OrderList).filter(OrderList.product_id == product.product_id).all()
        assert len(orders) == 0

    def test_multiple_active_orders_aggregated_and_prevents_duplicate(self, in_memory_db):
        db = in_memory_db
        retailer = Retailer(retailer_name="Metro Retail", contact_email="m@example.com")
        db.add(retailer)
        db.commit()

        product = Product(
            retailer_id=retailer.retailer_id,
            product_name="Detergent",
            category="cleaning",
            sku_code="DET-01",
            created_at=datetime.now() - timedelta(days=90)
        )
        db.add(product)
        db.commit()

        inv = Inventory(
            product_id=product.product_id,
            retailer_id=retailer.retailer_id,
            current_stock=10,
            reorder_point=50,
            safety_stock=20
        )
        db.add(inv)

        config = WeightConfig(retailer_id=retailer.retailer_id, config_name="Standard")
        db.add(config)
        db.commit()

        weightage = Weightage(
            product_id=product.product_id,
            retailer_id=retailer.retailer_id,
            config_id=config.config_id,
            sales_volume_weight=0.2, lead_time_weight=0.1, supplier_quality_weight=0.1,
            popularity_weight=0.1, weather_weight=0.1, festival_demand_weight=0.1,
            durability_weight=0.15, expiry_weight=0.15,
            recommendation_score=75.0
        )
        db.add(weightage)
        db.commit()

        # Add 3 orders with different active statuses: pending, approved, ordered
        # weightage_id required (NOT NULL constraint in Order_List model)
        o1 = OrderList(product_id=product.product_id, weightage_id=weightage.weightage_id, retailer_id=retailer.retailer_id, recommended_order_qty=15, status="pending")
        o2 = OrderList(product_id=product.product_id, weightage_id=weightage.weightage_id, retailer_id=retailer.retailer_id, recommended_order_qty=20, status="approved")
        o3 = OrderList(product_id=product.product_id, weightage_id=weightage.weightage_id, retailer_id=retailer.retailer_id, recommended_order_qty=10, status="ordered")
        db.add_all([o1, o2, o3])
        db.commit()

        total_pending = OrderListRepository.get_pending_quantity_for_product(db, product.product_id, retailer.retailer_id)
        assert total_pending == 45  # 15 + 20 + 10

        # Generating recommendation should see active orders and not spawn a 4th order
        initial_order_count = db.query(OrderList).filter(OrderList.product_id == product.product_id).count()
        rec = ReorderingEngineService._generate_recommendation_for_product(
            db=db, retailer=retailer, config_id=config.config_id, product=product
        )
        final_order_count = db.query(OrderList).filter(OrderList.product_id == product.product_id).count()
        assert final_order_count == initial_order_count  # No duplicate order created

    def test_zero_demand_below_safety_stock_replenishes_safety_stock(self, in_memory_db):
        db = in_memory_db
        retailer = Retailer(retailer_name="Metro Retail", contact_email="m@example.com")
        db.add(retailer)
        db.commit()

        product = Product(
            retailer_id=retailer.retailer_id,
            product_name="New Zero Sales Item",
            category="misc",
            sku_code="ZERO-01",
            created_at=datetime.now() - timedelta(days=90)
        )
        db.add(product)
        db.commit()

        inv = Inventory(
            product_id=product.product_id,
            retailer_id=retailer.retailer_id,
            current_stock=2,
            reorder_point=10,
            safety_stock=15
        )
        db.add(inv)

        config = WeightConfig(retailer_id=retailer.retailer_id, config_name="Standard")
        db.add(config)
        db.commit()

        weightage = Weightage(
            product_id=product.product_id,
            retailer_id=retailer.retailer_id,
            config_id=config.config_id,
            sales_volume_weight=0.2, lead_time_weight=0.1, supplier_quality_weight=0.1,
            popularity_weight=0.1, weather_weight=0.1, festival_demand_weight=0.1,
            durability_weight=0.15, expiry_weight=0.15,
            recommendation_score=40.0
        )
        db.add(weightage)
        db.commit()

        # No sales records in DB. Target stock = 0 * lead_time + 15 = 15.
        # Inventory position = 2. Reorder quantity = 15 - 2 = 13.
        rec = ReorderingEngineService._generate_recommendation_for_product(
            db=db, retailer=retailer, config_id=config.config_id, product=product
        )
        assert rec.reorder_required is True
        assert rec.reorder_quantity == 13

    def test_missing_supplier_handled_gracefully(self, in_memory_db):
        db = in_memory_db
        retailer = Retailer(retailer_name="Metro Retail", contact_email="m@example.com")
        db.add(retailer)
        db.commit()

        product = Product(
            retailer_id=retailer.retailer_id,
            product_name="No Supplier Product",
            category="misc",
            sku_code="NOSUP-01",
            created_at=datetime.now() - timedelta(days=90)
        )
        db.add(product)
        db.commit()

        inv = Inventory(
            product_id=product.product_id,
            retailer_id=retailer.retailer_id,
            current_stock=0,
            reorder_point=5,
            safety_stock=10
        )
        db.add(inv)

        config = WeightConfig(retailer_id=retailer.retailer_id, config_name="Standard")
        db.add(config)
        db.commit()

        weightage = Weightage(
            product_id=product.product_id,
            retailer_id=retailer.retailer_id,
            config_id=config.config_id,
            sales_volume_weight=0.2, lead_time_weight=0.1, supplier_quality_weight=0.1,
            popularity_weight=0.1, weather_weight=0.1, festival_demand_weight=0.1,
            durability_weight=0.15, expiry_weight=0.15,
            recommendation_score=50.0
        )
        db.add(weightage)
        db.commit()

        # No suppliers linked to product
        rec = ReorderingEngineService._generate_recommendation_for_product(
            db=db, retailer=retailer, config_id=config.config_id, product=product
        )
        assert rec.supplier_id is None
        assert rec.reorder_quantity == 10  # Replenishes safety stock without unhandled error

    def test_missing_inventory_raises_value_error(self, in_memory_db):
        db = in_memory_db
        retailer = Retailer(retailer_name="Metro Retail", contact_email="m@example.com")
        db.add(retailer)
        db.commit()

        product = Product(
            retailer_id=retailer.retailer_id,
            product_name="Ghost Product",
            category="misc",
            sku_code="GHOST-01",
            created_at=datetime.now() - timedelta(days=90)
        )
        db.add(product)
        db.commit()

        config = WeightConfig(retailer_id=retailer.retailer_id, config_name="Standard")
        db.add(config)
        db.commit()

        weightage = Weightage(
            product_id=product.product_id,
            retailer_id=retailer.retailer_id,
            config_id=config.config_id,
            sales_volume_weight=0.2, lead_time_weight=0.1, supplier_quality_weight=0.1,
            popularity_weight=0.1, weather_weight=0.1, festival_demand_weight=0.1,
            durability_weight=0.15, expiry_weight=0.15,
            recommendation_score=50.0
        )
        db.add(weightage)
        db.commit()

        with pytest.raises(ValueError, match="No inventory found"):
            ReorderingEngineService._generate_recommendation_for_product(
                db=db, retailer=retailer, config_id=config.config_id, product=product
            )
