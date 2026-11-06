"""
Tests for ReorderCalculator — Inventory Position, Target Stock, Reorder Quantity, and Decision logic.
"""

import pytest
from app.reordering_engine.reorder_calculator import ReorderCalculator


class TestInventoryPosition:
    def test_inventory_position_formula(self):
        # On-hand 50 + on-order 20 - backorders 0 = 70
        pos = ReorderCalculator.calculate_inventory_position(
            current_stock=50,
            on_order_qty=20,
            backorders=0
        )
        assert pos == 70

    def test_handles_none_safely(self):
        pos = ReorderCalculator.calculate_inventory_position(None, None, None)
        assert pos == 0

    def test_backorders_reduce_position(self):
        pos = ReorderCalculator.calculate_inventory_position(
            current_stock=30,
            on_order_qty=10,
            backorders=5
        )
        assert pos == 35

    def test_backorders_exceeding_available_and_incoming_gives_negative_position(self):
        # On-hand 10 + on-order 5 - backorders 25 = -10 (legitimate negative inventory position)
        pos = ReorderCalculator.calculate_inventory_position(
            current_stock=10,
            on_order_qty=5,
            backorders=25
        )
        assert pos == -10

    def test_on_order_covering_backorders(self):
        # On-hand 0 + on-order 30 - backorders 20 = 10
        pos = ReorderCalculator.calculate_inventory_position(
            current_stock=0,
            on_order_qty=30,
            backorders=20
        )
        assert pos == 10

    def test_zero_stock_with_outstanding_backorders(self):
        # On-hand 0 + on-order 0 - backorders 15 = -15
        pos = ReorderCalculator.calculate_inventory_position(
            current_stock=0,
            on_order_qty=0,
            backorders=15
        )
        assert pos == -15

    def test_negative_input_validation(self):
        with pytest.raises(ValueError, match="current_stock cannot be negative"):
            ReorderCalculator.calculate_inventory_position(current_stock=-5)

        with pytest.raises(ValueError, match="on_order_qty cannot be negative"):
            ReorderCalculator.calculate_inventory_position(current_stock=10, on_order_qty=-2)

        with pytest.raises(ValueError, match="backorders cannot be negative"):
            ReorderCalculator.calculate_inventory_position(current_stock=10, backorders=-1)


class TestTargetStock:
    def test_target_stock_calculation(self):
        # Demand: 5 units/day × 10 lead time days = 50. Safety stock = 20. Target = 70.
        target = ReorderCalculator.calculate_target_stock(
            average_daily_sales=5.0,
            lead_time_days=10,
            safety_stock=20
        )
        assert target == 70.0


class TestCalculateReorderQuantity:
    def test_reorder_quantity_with_inventory_position(self):
        # Target stock = 5 * 10 + 20 = 70.
        # Inventory position = on-hand 30 + on-order 10 = 40.
        # Net reorder needed = 70 - 40 = 30.
        qty = ReorderCalculator.calculate_reorder_quantity(
            current_stock=30,
            average_daily_sales=5.0,
            lead_time_days=10,
            safety_stock=20,
            on_order_qty=10
        )
        assert qty == 30

    def test_current_stock_sufficient_gives_zero(self):
        # Target stock = 2 * 7 + 10 = 24.
        # Current stock = 100. Reorder qty must be 0.
        qty = ReorderCalculator.calculate_reorder_quantity(
            current_stock=100,
            average_daily_sales=2.0,
            lead_time_days=7,
            safety_stock=10,
            on_order_qty=0
        )
        assert qty == 0

    def test_on_order_plus_on_hand_exceeds_target_returns_zero(self):
        # Target stock = 10 * 7 + 20 = 90.
        # Current stock 40 + on-order 60 = 100.
        qty = ReorderCalculator.calculate_reorder_quantity(
            current_stock=40,
            average_daily_sales=10.0,
            lead_time_days=7,
            safety_stock=20,
            on_order_qty=60
        )
        assert qty == 0

    def test_zero_sales_stockout_replenishes_safety_stock(self):
        # Target = 0 + 15 = 15. On-hand 0, on-order 0. Qty = 15.
        qty = ReorderCalculator.calculate_reorder_quantity(
            current_stock=0,
            average_daily_sales=0.0,
            lead_time_days=7,
            safety_stock=15,
            on_order_qty=0
        )
        assert qty == 15

    def test_fractional_target_ceils_upward(self):
        # Target: 1.5 * 7 + 0 = 10.5. On-hand 0. Ceil(10.5) = 11.
        qty = ReorderCalculator.calculate_reorder_quantity(
            current_stock=0,
            average_daily_sales=1.5,
            lead_time_days=7,
            safety_stock=0,
            on_order_qty=0
        )
        assert qty == 11

    def test_negative_inventory_position_increases_reorder_quantity(self):
        # Target stock = 5 * 10 + 20 = 70.
        # Current stock 0, on-order 0, backorders 15 -> inv_position = -15.
        # Net reorder needed = 70 - (-15) = 85.
        qty = ReorderCalculator.calculate_reorder_quantity(
            current_stock=0,
            average_daily_sales=5.0,
            lead_time_days=10,
            safety_stock=20,
            on_order_qty=0,
            backorders=15
        )
        assert qty == 85


class TestShouldReorder:
    def test_reorders_when_inventory_position_below_reorder_point(self):
        assert ReorderCalculator.should_reorder(
            recommendation_score=30.0,
            current_stock=5,
            reorder_point=10,
            on_order_qty=0,
            reorder_quantity=15
        )

    def test_no_reorder_when_on_order_covers_reorder_point(self):
        # On-hand 5, on-order 20 → position 25 > reorder_point 10. Score low.
        assert not ReorderCalculator.should_reorder(
            recommendation_score=30.0,
            current_stock=5,
            reorder_point=10,
            on_order_qty=20,
            reorder_quantity=0
        )

    def test_reorder_required_when_score_high_and_quantity_needed(self):
        assert ReorderCalculator.should_reorder(
            recommendation_score=65.0,
            current_stock=100,
            reorder_point=20,
            on_order_qty=0,
            reorder_quantity=30
        )

    def test_no_reorder_when_quantity_is_zero(self):
        # Even if score >= 55, if reorder_quantity is 0, we do not reorder
        assert not ReorderCalculator.should_reorder(
            recommendation_score=80.0,
            current_stock=100,
            reorder_point=20,
            on_order_qty=0,
            reorder_quantity=0
        )

    def test_reorders_when_backorders_cause_negative_position(self):
        # On-hand 0, backorders 10 -> inv_position = -10 <= reorder_point 0
        assert ReorderCalculator.should_reorder(
            recommendation_score=20.0,
            current_stock=0,
            reorder_point=0,
            on_order_qty=0,
            backorders=10,
            reorder_quantity=50
        )
