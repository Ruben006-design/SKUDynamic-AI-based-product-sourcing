"""
Tests for LocalWeightageEngine — deterministic local weight generation and 3 demand profiles.
"""

import pytest
from unittest.mock import MagicMock
from datetime import date, timedelta
from app.weightage_engine.local_engine import LocalWeightageEngine


def make_product(category="electronics", durability_days=180, expiry_date=None, name="Test Product"):
    p = MagicMock()
    p.category = category
    p.durability_days = durability_days
    p.expiry_date = expiry_date
    p.product_name = name
    p.created_at = None
    return p


def make_product_supplier(quality_score=0.9, lead_time_days=7):
    supplier = MagicMock()
    supplier.quality_score = quality_score
    supplier.lead_time_days = lead_time_days
    ps = MagicMock()
    ps.supplier = supplier
    return ps


def make_sale(sale_date, quantity_sold, popularity_score=5):
    s = MagicMock()
    s.sale_date = sale_date
    s.quantity_sold = quantity_sold
    s.popularity_score = popularity_score
    return s


WEIGHT_KEYS = [
    "sales_volume_weight",
    "lead_time_weight",
    "supplier_quality_weight",
    "popularity_weight",
    "weather_weight",
    "festival_demand_weight",
    "durability_weight",
    "expiry_weight",
]


class TestLocalEngineWeightSum:
    def test_weights_sum_to_1_for_electronics(self):
        p = make_product(category="electronics")
        weights = LocalWeightageEngine.generate_weights(p, None, [], [])
        total = round(sum(weights.values()), 4)
        assert total == 1.0

    def test_all_weights_non_negative(self):
        p = make_product()
        weights = LocalWeightageEngine.generate_weights(p, None, [], [])
        for key, val in weights.items():
            assert val >= 0.0, f"{key} is negative: {val}"


class TestThreeProductDemandProfiles:
    def test_profile_1_high_velocity_perishable(self):
        """
        Profile 1: Fresh Milk / Bakery
        High daily volume, short durability, expiring soon.
        Expected: expiry_weight and sales_volume_weight are elevated.
        """
        today = date.today()
        sales = [make_sale(today - timedelta(days=i), 80) for i in range(90)]
        milk = make_product(
            category="dairy food",
            durability_days=5,
            expiry_date=today + timedelta(days=3),
            name="Organic Whole Milk"
        )
        ps = make_product_supplier(quality_score=0.95, lead_time_days=2)
        weights = LocalWeightageEngine.generate_weights(milk, None, sales, [ps])

        assert round(sum(weights.values()), 4) == 1.0
        assert weights["expiry_weight"] > 0.15
        assert weights["sales_volume_weight"] > 0.20

    def test_profile_2_seasonal_festival_apparel(self):
        """
        Profile 2: Festival Silk Saree
        Moderate volume, seasonal & festival affinity, long shelf life.
        Expected: festival_demand_weight and weather_weight are elevated; expiry_weight is minimal.
        """
        today = date.today()
        sales = [make_sale(today - timedelta(days=i), 15) for i in range(90)]
        saree = make_product(
            category="apparel clothing fashion",
            durability_days=730,
            expiry_date=None,
            name="Festival Silk Saree"
        )
        ps = make_product_supplier(quality_score=0.90, lead_time_days=14)
        weights = LocalWeightageEngine.generate_weights(saree, None, sales, [ps])

        assert round(sum(weights.values()), 4) == 1.0
        assert weights["festival_demand_weight"] >= 0.10
        assert weights["weather_weight"] >= 0.10
        assert weights["expiry_weight"] <= 0.08

    def test_profile_3_slow_moving_industrial_hardware(self):
        """
        Profile 3: Industrial Pump Spare Part
        Low volume, erratic sales, long lead time (45 days), non-perishable.
        Expected: lead_time_weight is elevated, expiry_weight is low.
        """
        today = date.today()
        sales = [make_sale(today - timedelta(days=i * 10), 2) for i in range(9)]
        part = make_product(
            category="industrial hardware tools",
            durability_days=1000,
            expiry_date=None,
            name="Industrial Valve"
        )
        ps = make_product_supplier(quality_score=0.70, lead_time_days=45)
        weights = LocalWeightageEngine.generate_weights(part, None, sales, [ps])

        assert round(sum(weights.values()), 4) == 1.0
        assert weights["lead_time_weight"] > 0.12
        assert weights["expiry_weight"] <= 0.08


class TestDemandVariabilityAndTrendSignals:
    def test_separates_volume_and_variability(self):
        today = date.today()
        # High volume stable
        stable_high = [make_sale(today - timedelta(days=i), 50) for i in range(90)]
        # Low volume erratic
        volatile_low = [make_sale(today - timedelta(days=i * 5), 5) for i in range(18)]

        avg1, cv1, _ = LocalWeightageEngine._sales_stats(stable_high, as_of_date=today)
        avg2, cv2, _ = LocalWeightageEngine._sales_stats(volatile_low, as_of_date=today)

        assert avg1 > avg2          # Volume: stable_high has far higher volume
        assert cv2 > cv1          # Variability: volatile_low has far higher CV
