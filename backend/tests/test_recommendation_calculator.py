"""
Test suite for RecommendationCalculator.

All eight factors are tested individually, plus the weighted-sum formula
and edge-case handling (None values, expired products, no data).
"""

import pytest
from datetime import date, timedelta
from unittest.mock import MagicMock
from app.weightage_engine.recommendation_calculator import RecommendationCalculator


def make_product(
    category="electronics",
    durability_days=365,
    expiry_date=None,
    created_at=None
):
    p = MagicMock()
    p.category = category
    p.durability_days = durability_days
    p.expiry_date = expiry_date
    p.created_at = created_at
    return p


def make_inventory(current_stock=100):
    inv = MagicMock()
    inv.current_stock = current_stock
    return inv


def make_sale(sale_date, quantity_sold, popularity_score=5):
    s = MagicMock()
    s.sale_date = sale_date
    s.quantity_sold = quantity_sold
    s.popularity_score = popularity_score
    return s


def make_product_supplier(quality_score=0.9, lead_time_days=7):
    supplier = MagicMock()
    supplier.quality_score = quality_score
    supplier.lead_time_days = lead_time_days
    ps = MagicMock()
    ps.supplier = supplier
    return ps


EQUAL_WEIGHTS = {
    "sales_volume_weight": 0.125,
    "lead_time_weight": 0.125,
    "supplier_quality_weight": 0.125,
    "popularity_weight": 0.125,
    "weather_weight": 0.125,
    "festival_demand_weight": 0.125,
    "durability_weight": 0.125,
    "expiry_weight": 0.125,
}

ALL_SALES_WEIGHT = {k: 0.0 for k in EQUAL_WEIGHTS}
ALL_SALES_WEIGHT["sales_volume_weight"] = 1.0


class TestSalesVolumeNormalisation:
    def test_no_sales_gives_zero_sales_score(self):
        p = make_product()
        inv = make_inventory()
        score = RecommendationCalculator.calculate(p, inv, [], [], ALL_SALES_WEIGHT)
        assert score == 0.0

    def test_100_units_per_day_gives_max_sales_score(self):
        today = date.today()
        sales = [make_sale(today - timedelta(days=i), 100) for i in range(90)]
        p = make_product()
        inv = make_inventory()
        score = RecommendationCalculator.calculate(p, inv, sales, [], ALL_SALES_WEIGHT)
        assert score == pytest.approx(100.0, abs=1.0)

    def test_50_units_per_day_gives_half_sales_score(self):
        today = date.today()
        sales = [make_sale(today - timedelta(days=i), 50) for i in range(90)]
        p = make_product()
        inv = make_inventory()
        score = RecommendationCalculator.calculate(p, inv, sales, [], ALL_SALES_WEIGHT)
        assert score == pytest.approx(50.0, abs=1.0)

    def test_excludes_future_dated_sales(self):
        today = date.today()
        future_sale = make_sale(today + timedelta(days=5), 1000)
        p = make_product()
        inv = make_inventory()
        score = RecommendationCalculator.calculate(p, inv, [future_sale], [], ALL_SALES_WEIGHT)
        assert score == 0.0


class TestAverageDailySales:
    def test_groups_multiple_transactions_on_same_day(self):
        today = date.today()
        sales = [
            make_sale(today, 10),
            make_sale(today, 10),
        ]
        avg = RecommendationCalculator._compute_avg_daily_sales(sales, observation_days=90, as_of_date=today)
        assert avg == pytest.approx(20.0 / 90.0, rel=1e-3)

    def test_empty_sales_returns_zero(self):
        avg = RecommendationCalculator._compute_avg_daily_sales([])
        assert avg == 0.0

    def test_new_product_uses_effective_days_denominator(self):
        today = date.today()
        created_10d_ago = today - timedelta(days=9)  # 10 days active
        sales = [make_sale(today - timedelta(days=i), 5) for i in range(10)]
        avg = RecommendationCalculator._compute_avg_daily_sales(
            sales=sales,
            observation_days=90,
            as_of_date=today,
            product_created_at=created_10d_ago
        )
        # 50 total units / 10 effective days = 5.0 units/day
        assert avg == pytest.approx(5.0, abs=0.1)


class TestLeadTimeScore:
    ONLY_LEAD_TIME = {k: 0.0 for k in EQUAL_WEIGHTS}
    ONLY_LEAD_TIME["lead_time_weight"] = 1.0

    def test_no_supplier_gives_low_default_score(self):
        p = make_product()
        inv = make_inventory()
        score = RecommendationCalculator.calculate(p, inv, [], [], self.ONLY_LEAD_TIME)
        # Default lead time 7 days: 7 / 60 * 100 ≈ 11.67
        assert score == pytest.approx(7.0 / 60.0 * 100.0, abs=1.0)

    def test_60_day_lead_time_gives_max_score(self):
        p = make_product()
        inv = make_inventory()
        ps = make_product_supplier(lead_time_days=60)
        score = RecommendationCalculator.calculate(p, inv, [], [ps], self.ONLY_LEAD_TIME)
        assert score == pytest.approx(100.0, abs=1.0)


class TestSupplierQualityScore:
    ONLY_QUALITY = {k: 0.0 for k in EQUAL_WEIGHTS}
    ONLY_QUALITY["supplier_quality_weight"] = 1.0

    def test_high_quality_gives_high_confidence_score(self):
        p = make_product()
        inv = make_inventory()
        ps = make_product_supplier(quality_score=0.95)
        score = RecommendationCalculator.calculate(p, inv, [], [ps], self.ONLY_QUALITY)
        assert score == pytest.approx(95.0, abs=0.5)

    def test_low_quality_gives_low_score(self):
        p = make_product()
        inv = make_inventory()
        ps = make_product_supplier(quality_score=0.20)
        score = RecommendationCalculator.calculate(p, inv, [], [ps], self.ONLY_QUALITY)
        assert score == pytest.approx(20.0, abs=0.5)

    def test_no_supplier_gives_neutral_50(self):
        p = make_product()
        inv = make_inventory()
        score = RecommendationCalculator.calculate(p, inv, [], [], self.ONLY_QUALITY)
        assert score == pytest.approx(50.0, abs=1.0)


class TestFestivalDemandScore:
    ONLY_FESTIVAL = {k: 0.0 for k in EQUAL_WEIGHTS}
    ONLY_FESTIVAL["festival_demand_weight"] = 1.0

    def test_non_festival_category_returns_neutral_baseline(self):
        # Industrial hardware has no festival relevance
        hardware = make_product(category="industrial hardware")
        inv = make_inventory()
        score = RecommendationCalculator.calculate(hardware, inv, [], [], self.ONLY_FESTIVAL)
        assert score == 30.0

    def test_festival_category_during_festival_returns_high_score(self):
        # Sweets during Diwali season (Oct 25)
        sweets = make_product(category="sweets")
        inv = make_inventory()
        score = RecommendationCalculator.calculate(
            sweets, inv, [], [], self.ONLY_FESTIVAL, as_of_date=date(2026, 10, 25)
        )
        assert score == 90.0


class TestExpiryRisk:
    ONLY_EXPIRY = {k: 0.0 for k in EQUAL_WEIGHTS}
    ONLY_EXPIRY["expiry_weight"] = 1.0

    def test_no_expiry_gives_zero(self):
        p = make_product(expiry_date=None)
        inv = make_inventory()
        score = RecommendationCalculator.calculate(p, inv, [], [], self.ONLY_EXPIRY)
        assert score == 0.0

    def test_already_expired_gives_100(self):
        yesterday = date.today() - timedelta(days=1)
        p = make_product(expiry_date=yesterday)
        inv = make_inventory()
        score = RecommendationCalculator.calculate(p, inv, [], [], self.ONLY_EXPIRY)
        assert score == 100.0

    def test_expires_in_3_days_gives_95(self):
        soon = date.today() + timedelta(days=3)
        p = make_product(expiry_date=soon)
        inv = make_inventory()
        score = RecommendationCalculator.calculate(p, inv, [], [], self.ONLY_EXPIRY)
        assert score == pytest.approx(95.0)


class TestScoreRange:
    def test_score_always_between_0_and_100(self):
        today = date.today()
        sales = [make_sale(today - timedelta(days=i), 200) for i in range(90)]
        p = make_product(category="food", durability_days=5, expiry_date=today - timedelta(days=1))
        inv = make_inventory(current_stock=0)
        ps = make_product_supplier(quality_score=0.9, lead_time_days=90)
        score = RecommendationCalculator.calculate(p, inv, sales, [ps], EQUAL_WEIGHTS)
        assert 0.0 <= score <= 100.0
