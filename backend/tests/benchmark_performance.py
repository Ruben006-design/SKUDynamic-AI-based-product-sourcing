"""
Reproducible Performance Benchmark for SKUDynamic AI Engine.
Evaluates:
- Tier 1: 30 products (Boutique Retailer)
- Tier 2: 300 products (Supermarket Store)
- Tier 3: 3,000 products (Regional Department Store)
- Tier 4: 30,000 products (Enterprise Retail Chain / Scalability Limit)

Performs 3 repetitions per tier to capture Min, Median, and Max processing times.
Measures both SQLite (in-memory) and Live MySQL engines separately.
"""

import os
import sys
import time
import tracemalloc
import statistics
import random
from datetime import date, datetime, timedelta

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

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
from app.weightage_engine.local_engine import LocalWeightageEngine
from app.weightage_engine.recommendation_calculator import RecommendationCalculator
from app.reordering_engine.reorder_calculator import ReorderCalculator
from app.reordering_engine.supplier_selector import SupplierSelector
from app.database.database import engine as mysql_engine


def setup_benchmark_dataset(session, num_products: int):
    """Generates synthetic relational dataset for num_products."""
    retailer = Retailer(retailer_name=f"BenchMart_{random.randint(100,999)}", contact_email="bench@example.com")
    session.add(retailer)
    session.flush()

    config = WeightConfig(
        retailer_id=retailer.retailer_id,
        config_name="Standard",
        sales_volume_w=0.25,
        lead_time_w=0.15,
        supplier_quality_w=0.15,
        popularity_w=0.10,
        weather_w=0.10,
        festival_demand_w=0.05,
        durability_w=0.10,
        expiry_w=0.10
    )
    session.add(config)
    session.flush()

    suppliers = []
    for i in range(5):
        sup = Supplier(
            retailer_id=retailer.retailer_id,
            supplier_name=f"Supplier_{i}_{random.randint(10,99)}",
            lead_time_days=random.randint(3, 21),
            quality_score=round(random.uniform(0.70, 0.98), 2)
        )
        session.add(sup)
        suppliers.append(sup)
    session.flush()

    today = date.today()
    created_base = datetime.now() - timedelta(days=90)
    categories = ["grocery", "electronics", "apparel", "pharmacy", "hardware"]

    products = []
    inventories = []
    prod_suppliers = []
    sales_batch = []

    for i in range(num_products):
        cat = categories[i % len(categories)]
        prod = Product(
            retailer_id=retailer.retailer_id,
            product_name=f"SKU_{i:05d}",
            category=cat,
            sku_code=f"SKU-{i:05d}-{random.randint(1000,9999)}",
            unit_cost=round(random.uniform(5.0, 100.0), 2),
            durability_days=random.choice([14, 60, 365, 730]),
            created_at=created_base
        )
        products.append(prod)

    session.add_all(products)
    session.flush()

    for prod in products:
        stock = random.randint(0, 150)
        reorder_pt = random.randint(20, 50)
        safety_st = random.randint(10, 30)
        inv = Inventory(
            product_id=prod.product_id,
            retailer_id=retailer.retailer_id,
            current_stock=stock,
            reorder_point=reorder_pt,
            safety_stock=safety_st
        )
        inventories.append(inv)

        selected_sups = random.sample(suppliers, 2)
        ps1 = ProductSupplier(
            product_id=prod.product_id,
            supplier_id=selected_sups[0].supplier_id,
            negotiated_price=round(prod.unit_cost * 0.95, 2),
            is_preferred=True
        )
        ps2 = ProductSupplier(
            product_id=prod.product_id,
            supplier_id=selected_sups[1].supplier_id,
            negotiated_price=round(prod.unit_cost * 0.92, 2),
            is_preferred=False
        )
        prod_suppliers.extend([ps1, ps2])

        for s_idx in range(5):
            sale_dt = today - timedelta(days=random.randint(0, 89))
            sales_batch.append(Sales(
                product_id=prod.product_id,
                retailer_id=retailer.retailer_id,
                sale_date=sale_dt,
                quantity_sold=random.randint(1, 20),
                revenue=round(random.uniform(20.0, 500.0), 2),
                popularity_score=random.randint(5, 10)
            ))

    session.add_all(inventories)
    session.add_all(prod_suppliers)
    session.add_all(sales_batch)
    session.commit()

    return retailer, config, products, suppliers


def run_benchmark_trial(session, retailer, config, products, num_products: int):
    """Executes a single benchmark run on pre-populated data and measures time + RAM."""
    inv_map = {inv.product_id: inv for inv in session.query(Inventory).filter(Inventory.retailer_id == retailer.retailer_id).all()}
    all_suppliers = session.query(ProductSupplier).all()
    sup_map = {}
    for ps in all_suppliers:
        sup_map.setdefault(ps.product_id, []).append(ps)

    # 1. Weightage generation
    tracemalloc.start()
    t_w0 = time.perf_counter()
    weightages = []
    for prod in products:
        inv = inv_map.get(prod.product_id)
        weights = LocalWeightageEngine.generate_weights(
            product=prod,
            inventory=inv,
            sales=[],
            product_suppliers=sup_map.get(prod.product_id, []),
            human_evaluations=[]
        )
        score = RecommendationCalculator.calculate(
            product=prod,
            inventory=inv,
            sales=[],
            suppliers=sup_map.get(prod.product_id, []),
            weights=weights
        )
        weightages.append(score)

    t_w1 = time.perf_counter() - t_w0
    _, mem_peak_w = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    # 2. Recommendation and decision generation
    tracemalloc.start()
    t_r0 = time.perf_counter()
    reorders = 0
    for prod in products:
        inv = inv_map.get(prod.product_id)
        prod_sups = sup_map.get(prod.product_id, [])
        best_sup = SupplierSelector.select_best_supplier(prod_sups)
        lead_time = int(best_sup.lead_time_days) if best_sup else 7
        safety_stock = int(inv.safety_stock or 0)
        current_stock = int(inv.current_stock or 0)

        reorder_qty = ReorderCalculator.calculate_reorder_quantity(
            current_stock=current_stock,
            average_daily_sales=2.5,
            lead_time_days=lead_time,
            safety_stock=safety_stock,
            on_order_qty=0
        )
        should_ord = ReorderCalculator.should_reorder(
            recommendation_score=60.0,
            current_stock=current_stock,
            reorder_point=inv.reorder_point,
            on_order_qty=0,
            reorder_quantity=reorder_qty
        )
        if should_ord and reorder_qty > 0:
            reorders += 1

    t_r1 = time.perf_counter() - t_r0
    _, mem_peak_r = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    peak_ram_mb = max(mem_peak_w, mem_peak_r) / (1024 * 1024)
    total_time = t_w1 + t_r1

    return {
        "weightage_time": t_w1,
        "recommendation_time": t_r1,
        "total_time": total_time,
        "reorders": reorders,
        "peak_ram_mb": peak_ram_mb
    }


def benchmark_tier_with_repetitions(scale_label: str, num_products: int, repetitions: int = 3, use_mysql: bool = False):
    """Runs multiple repetitions of a benchmark tier and computes min, median, max."""
    db_name = "MySQL (localhost:3306)" if use_mysql else "SQLite (in-memory)"
    print(f"\n--- Testing {scale_label} ({num_products:,} SKUs) on {db_name} [{repetitions} runs] ---")

    if use_mysql:
        Session = sessionmaker(bind=mysql_engine)
        session = Session()
    else:
        engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(engine)
        Session = sessionmaker(bind=engine)
        session = Session()

    try:
        t0 = time.perf_counter()
        retailer, config, products, suppliers = setup_benchmark_dataset(session, num_products)
        t_pop = time.perf_counter() - t0
        print(f"    Populated {num_products:,} SKUs in {t_pop:.2f}s")

        w_times, r_times, tot_times, rams = [], [], [], []
        reorders = 0

        for r_i in range(repetitions):
            trial = run_benchmark_trial(session, retailer, config, products, num_products)
            w_times.append(trial["weightage_time"])
            r_times.append(trial["recommendation_time"])
            tot_times.append(trial["total_time"])
            rams.append(trial["peak_ram_mb"])
            reorders = trial["reorders"]
            print(f"    Run {r_i+1}: Weightage={trial['weightage_time']:.3f}s | Reorder={trial['recommendation_time']:.3f}s | Total={trial['total_time']:.3f}s | RAM={trial['peak_ram_mb']:.2f}MB")

        med_w = statistics.median(w_times)
        med_r = statistics.median(r_times)
        med_tot = statistics.median(tot_times)
        min_tot = min(tot_times)
        max_tot = max(tot_times)
        med_ram = statistics.median(rams)
        throughput = num_products / max(0.001, med_tot)

        return {
            "tier": scale_label,
            "engine": db_name,
            "skus": num_products,
            "min_total_s": round(min_tot, 4),
            "median_total_s": round(med_tot, 4),
            "max_total_s": round(max_tot, 4),
            "median_weightage_s": round(med_w, 4),
            "median_reorder_s": round(med_r, 4),
            "throughput_sku_s": round(throughput, 1),
            "median_ram_mb": round(med_ram, 2),
            "reorders": reorders
        }
    finally:
        if use_mysql:
            # Clean up test retailer data from live MySQL
            try:
                session.query(OrderList).filter(OrderList.retailer_id == retailer.retailer_id).delete()
                session.query(Sales).filter(Sales.retailer_id == retailer.retailer_id).delete()
                session.query(Inventory).filter(Inventory.retailer_id == retailer.retailer_id).delete()
                session.query(ProductSupplier).filter(ProductSupplier.supplier_id.in_([s.supplier_id for s in suppliers])).delete(synchronize_session=False)
                session.query(Product).filter(Product.retailer_id == retailer.retailer_id).delete()
                session.query(Supplier).filter(Supplier.retailer_id == retailer.retailer_id).delete()
                session.query(WeightConfig).filter(WeightConfig.retailer_id == retailer.retailer_id).delete()
                session.query(Retailer).filter(Retailer.retailer_id == retailer.retailer_id).delete()
                session.commit()
                print("    [Cleaned up MySQL benchmark records]")
            except Exception as e:
                session.rollback()
                print(f"    [Cleanup error: {e}]")
        session.close()


def main():
    print("=" * 80)
    print("SKUDYNAMIC AI - PHASE E COMPREHENSIVE PERFORMANCE VERIFICATION")
    print("=" * 80)

    results = []

    # 1. SQLite In-Memory Benchmarks (30, 300, 3,000, and 30,000 SKUs)
    results.append(benchmark_tier_with_repetitions("Tier 1 (Boutique)", 30, repetitions=3, use_mysql=False))
    results.append(benchmark_tier_with_repetitions("Tier 2 (Supermarket)", 300, repetitions=3, use_mysql=False))
    results.append(benchmark_tier_with_repetitions("Tier 3 (Department Store)", 3000, repetitions=3, use_mysql=False))
    # For 30,000 products: single extensive run to verify stress limit
    results.append(benchmark_tier_with_repetitions("Tier 4 (Enterprise)", 30000, repetitions=1, use_mysql=False))

    # 2. Live MySQL Server Benchmarks (30 and 300 SKUs)
    results.append(benchmark_tier_with_repetitions("Tier 1 (Boutique)", 30, repetitions=3, use_mysql=True))
    results.append(benchmark_tier_with_repetitions("Tier 2 (Supermarket)", 300, repetitions=3, use_mysql=True))

    print("\n" + "=" * 90)
    print("FINAL MEASURED BENCHMARK SUMMARY (MIN / MEDIAN / MAX REPETITIONS)")
    print("=" * 90)
    print(f"{'Tier':<22} | {'DB Engine':<20} | {'Median Total':<13} | {'Min Total':<10} | {'Max Total':<10} | {'Throughput':<14} | {'RAM':<8}")
    print("-" * 90)
    for r in results:
        print(f"{r['tier']:<22} | {r['engine']:<20} | {r['median_total_s']:>9.3f} s   | {r['min_total_s']:>7.3f} s  | {r['max_total_s']:>7.3f} s  | {r['throughput_sku_s']:>8,.1f} sku/s | {r['median_ram_mb']:>5.2f} MB")
    print("=" * 90)


if __name__ == "__main__":
    main()
