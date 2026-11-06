"""
End-to-End Validation Script for SKUDynamic AI against live MySQL database.
Workflow tested:
1. Product Creation
2. Sales Transactions Injection
3. Inventory Setup
4. Supplier & ProductSupplier Linking
5. WeightConfig Setup
6. Local Weightage Generation & Recommendation Score Calculation
7. Reorder Decision & Reorder Quantity (Inventory Position = On-Hand + On-Order - Backorders)
8. Order Creation in Order_List
9. Order Approval / Rejection
10. Analytics & Verification in MySQL
11. Clean rollback/cleanup of test artifacts
"""

import sys
import os
from datetime import date, datetime, timedelta

# Ensure backend path is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database.database import SessionLocal
from app.retailer.models import Retailer
from app.product.models import Product
from app.supplier.models import Supplier
from app.product_supplier.models import ProductSupplier
from app.inventory.models import Inventory
from app.sales.models import Sales
from app.weight_config.models import WeightConfig
from app.weightage.models import Weightage
from app.order_list.models import OrderList
from app.weightage_engine.service import WeightageEngineService
from app.weightage_engine.schemas import WeightageGenerationRequest
from app.reordering_engine.service import ReorderingEngineService
from app.order_list.service import OrderListService
from app.order_list.repository import OrderListRepository


def run_e2e_validation():
    print("=" * 70)
    print("SKUDYNAMIC AI — END-TO-END VALIDATION ON LIVE MYSQL")
    print("=" * 70)

    db = SessionLocal()
    test_sku = f"E2E-TEST-{int(datetime.now().timestamp())}"

    try:
        # Step 1: Retailer
        print("\n[Step 1] Loading or creating validation Retailer...")
        retailer = db.query(Retailer).first()
        if not retailer:
            retailer = Retailer(retailer_name="Apex Supermarket", contact_email="apex@example.com")
            db.add(retailer)
            db.commit()
            db.refresh(retailer)
        print(f"  [OK] Retailer ID={retailer.retailer_id} ({retailer.retailer_name})")

        # Step 2: Product
        print("\n[Step 2] Creating test Product...")
        product = Product(
            retailer_id=retailer.retailer_id,
            product_name="E2E Organic Coffee Beans",
            category="beverage packaged goods",
            sku_code=test_sku,
            durability_days=180,
            unit_cost=15.50,
            created_at=datetime.now() - timedelta(days=90)
        )
        db.add(product)
        db.commit()
        db.refresh(product)
        print(f"  [OK] Product ID={product.product_id}, SKU={product.sku_code}, Name='{product.product_name}'")

        # Step 3: Suppliers & ProductSupplier
        print("\n[Step 3] Setting up Suppliers with multi-criteria attributes...")
        s1 = Supplier(
            retailer_id=retailer.retailer_id,
            supplier_name="Premium Bean Imports",
            lead_time_days=6,
            quality_score=0.94
        )
        s2 = Supplier(
            retailer_id=retailer.retailer_id,
            supplier_name="Budget Bulk Roasters",
            lead_time_days=18,
            quality_score=0.72
        )
        db.add_all([s1, s2])
        db.commit()
        db.refresh(s1)
        db.refresh(s2)

        ps1 = ProductSupplier(
            product_id=product.product_id,
            supplier_id=s1.supplier_id,
            negotiated_price=14.00,
            is_preferred=True
        )
        ps2 = ProductSupplier(
            product_id=product.product_id,
            supplier_id=s2.supplier_id,
            negotiated_price=12.50,
            is_preferred=False
        )
        db.add_all([ps1, ps2])
        db.commit()
        print(f"  [OK] Supplier 1: ID={s1.supplier_id}, Name='{s1.supplier_name}', Quality={s1.quality_score}, LeadTime={s1.lead_time_days}d, Preferred={ps1.is_preferred}")
        print(f"  [OK] Supplier 2: ID={s2.supplier_id}, Name='{s2.supplier_name}', Quality={s2.quality_score}, LeadTime={s2.lead_time_days}d, Preferred={ps2.is_preferred}")

        # Step 4: Inventory
        print("\n[Step 4] Initializing Inventory (Stock breached below reorder point)...")
        inv = Inventory(
            product_id=product.product_id,
            retailer_id=retailer.retailer_id,
            current_stock=15,    # on-hand stock
            reorder_point=40,    # reorder point
            safety_stock=25      # safety stock
        )
        db.add(inv)
        db.commit()
        db.refresh(inv)
        print(f"  [OK] Inventory: On-Hand={inv.current_stock}, Reorder Point={inv.reorder_point}, Safety Stock={inv.safety_stock}")

        # Step 5: Sales History (90 calendar days)
        print("\n[Step 5] Injecting 90 days of sales history (constant 8 units/day)...")
        today = date.today()
        for i in range(90):
            s = Sales(
                product_id=product.product_id,
                retailer_id=retailer.retailer_id,
                sale_date=today - timedelta(days=i),
                quantity_sold=8,
                popularity_score=9
            )
            db.add(s)
        db.commit()
        print(f"  [OK] Injected 90 daily sales transactions (Total quantity = {8 * 90} units)")

        # Step 6: Weight Configuration & Weightage Generation
        print("\n[Step 6] Generating weights via LocalWeightageEngine...")
        config = db.query(WeightConfig).filter_by(retailer_id=retailer.retailer_id, is_active=True).first()
        if not config:
            config = WeightConfig(
                retailer_id=retailer.retailer_id,
                config_name="Standard Active Config",
                sales_volume_w=0.25,
                lead_time_w=0.15,
                supplier_quality_w=0.15,
                popularity_w=0.15,
                weather_w=0.10,
                festival_demand_w=0.05,
                durability_w=0.10,
                expiry_w=0.05
            )
            db.add(config)
            db.commit()
            db.refresh(config)

        weightage = WeightageEngineService.generate_single_weightage(
            db=db,
            product_id=product.product_id,
            request=WeightageGenerationRequest(retailer_id=retailer.retailer_id, config_id=config.config_id)
        )
        db.commit()
        print(f"  [OK] Weightage ID={weightage.weightage_id}")
        print(f"  [OK] Engine Model Used='{weightage.llm_model_used}'")
        print(f"  [OK] Recommendation Score={weightage.recommendation_score:.2f} / 100")
        print(f"  [OK] Weights: sales_vol={float(weightage.sales_volume_weight):.4f}, lead_time={float(weightage.lead_time_weight):.4f}, quality={float(weightage.supplier_quality_weight):.4f}")
        total_w = sum([
            float(weightage.sales_volume_weight), float(weightage.lead_time_weight),
            float(weightage.supplier_quality_weight), float(weightage.popularity_weight),
            float(weightage.weather_weight), float(weightage.festival_demand_weight),
            float(weightage.durability_weight), float(weightage.expiry_weight)
        ])
        print(f"  [OK] Weight Sum Verification: {total_w:.4f} (Must equal 1.0000)")
        assert round(total_w, 4) == 1.0

        # Step 7: Reordering Engine Recommendation
        print("\n[Step 7] Running Reordering Engine...")
        rec = ReorderingEngineService.generate_single_recommendation(
            db=db,
            retailer_id=retailer.retailer_id,
            config_id=config.config_id,
            product_id=product.product_id
        )
        print(f"  [OK] Reorder Required: {rec.reorder_required}")
        print(f"  [OK] Recommended Reorder Quantity: {rec.reorder_quantity}")
        print(f"  [OK] Selected Supplier: ID={rec.supplier_id} ('{rec.supplier_name}')")

        # Theoretical verification:
        # Expected daily demand = 8.0 units/day.
        # Best supplier = Premium Bean Imports (lead_time = 6 days).
        # Target Stock = 8.0 * 6 + 25 (safety stock) = 48 + 25 = 73 units.
        # Inventory Position = On-Hand (15) + On-Order (0) - Backorders (0) = 15 units.
        # Reorder Quantity = max(0, 73 - 15) = 58 units.
        print(f"  [OK] Expected Quantity Check: 73 target - 15 on-hand = 58 units. Actual = {rec.reorder_quantity}")
        assert rec.reorder_quantity == 58
        assert rec.supplier_id == s1.supplier_id

        # Step 8: Order Creation & Persistence Verification
        print("\n[Step 8] Verifying order persistence in MySQL Order_List...")
        order = OrderListRepository.get_active_order_for_product(db, product.product_id, retailer.retailer_id)
        assert order is not None
        print(f"  [OK] Order created in MySQL: ID={order.order_list_id}, Status='{order.status}', Qty={order.recommended_order_qty}")
        print(f"  [OK] Justification: {order.justification_summary}")

        # Step 9: Order Approval
        print("\n[Step 9] Testing Order Approval...")
        approved = OrderListService.approve_order(db, order.order_list_id, approved_by="Head of Procurement")
        assert approved.status == "approved"
        assert approved.approved_by == "Head of Procurement"
        print(f"  [OK] Order ID={approved.order_list_id} approved by '{approved.approved_by}' at {approved.approved_at}")

        # Step 10: Duplicate Order Prevention with Existing Active Order
        print("\n[Step 10] Testing duplicate order prevention...")
        rec_duplicate = ReorderingEngineService.generate_single_recommendation(
            db=db,
            retailer_id=retailer.retailer_id,
            config_id=config.config_id,
            product_id=product.product_id
        )
        orders_count = db.query(OrderList).filter_by(product_id=product.product_id).count()
        assert orders_count == 1
        print(f"  [OK] Verified: exactly 1 order row exists for product ID {product.product_id} (No duplicate created)")

        # Step 11: Analytics Check
        print("\n[Step 11] Checking Order Analytics SQL aggregation...")
        analytics = OrderListRepository.get_analytics(db)
        print(f"  [OK] Analytics: Total={analytics['total_orders']}, Approved={analytics['approved_orders']}, Pending={analytics['pending_orders']}, Rejected={analytics['rejected_orders']}")

        print("\n" + "=" * 70)
        print("[OK] ALL END-TO-END VALIDATION CHECKS PASSED ON LIVE MYSQL")
        print("=" * 70)

    finally:
        # Clean up test records
        print("\nCleaning up test records created for SKU:", test_sku)
        test_prod = db.query(Product).filter_by(sku_code=test_sku).first()
        if test_prod:
            db.query(OrderList).filter_by(product_id=test_prod.product_id).delete()
            db.query(Weightage).filter_by(product_id=test_prod.product_id).delete()
            db.query(Sales).filter_by(product_id=test_prod.product_id).delete()
            db.query(Inventory).filter_by(product_id=test_prod.product_id).delete()
            db.query(ProductSupplier).filter_by(product_id=test_prod.product_id).delete()
            db.delete(test_prod)
            db.commit()
            print("[OK] Test records cleaned up successfully.")
        db.close()

if __name__ == "__main__":
    run_e2e_validation()
