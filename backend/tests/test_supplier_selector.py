"""
Tests for SupplierSelector — multi-criteria supplier selection.
"""

import pytest
from datetime import date, timedelta
from unittest.mock import MagicMock
from app.reordering_engine.supplier_selector import SupplierSelector


def make_ps(
    name="Supplier",
    quality_score=0.8,
    lead_time_days=14,
    negotiated_price=100.0,
    is_preferred=False,
    contract_end=None
):
    supplier = MagicMock()
    supplier.supplier_name = name
    supplier.quality_score = quality_score
    supplier.lead_time_days = lead_time_days

    ps = MagicMock()
    ps.supplier = supplier
    ps.negotiated_price = negotiated_price
    ps.is_preferred = is_preferred
    ps.contract_end = contract_end
    return ps


class TestSupplierSelector:
    def test_returns_none_when_no_suppliers(self):
        assert SupplierSelector.select_best_supplier([]) is None

    def test_prefers_is_preferred_supplier(self):
        ordinary = make_ps("Ordinary", quality_score=0.95, lead_time_days=5, is_preferred=False)
        preferred = make_ps("Preferred", quality_score=0.70, lead_time_days=20, is_preferred=True)
        result = SupplierSelector.select_best_supplier([ordinary, preferred])
        assert result.supplier_name == "Preferred"

    def test_skips_expired_contract(self):
        expired = make_ps("Expired", contract_end=date.today() - timedelta(days=1))
        valid = make_ps("Valid", contract_end=date.today() + timedelta(days=30))
        result = SupplierSelector.select_best_supplier([expired, valid])
        assert result.supplier_name == "Valid"

    def test_all_expired_returns_none(self):
        past = date.today() - timedelta(days=1)
        ps1 = make_ps("A", contract_end=past)
        ps2 = make_ps("B", contract_end=past)
        result = SupplierSelector.select_best_supplier([ps1, ps2])
        assert result is None

    def test_selects_higher_quality_when_equal_preference(self):
        low_q = make_ps("LowQ", quality_score=0.5, lead_time_days=7)
        high_q = make_ps("HighQ", quality_score=0.9, lead_time_days=7)
        result = SupplierSelector.select_best_supplier([low_q, high_q])
        assert result.supplier_name == "HighQ"

    def test_lower_price_beats_higher_price_when_equal(self):
        cheap = make_ps("Cheap", quality_score=0.8, negotiated_price=50.0)
        expensive = make_ps("Expensive", quality_score=0.8, negotiated_price=200.0)
        result = SupplierSelector.select_best_supplier([cheap, expensive])
        assert result.supplier_name == "Cheap"

    def test_single_supplier_always_selected(self):
        ps = make_ps("Only")
        result = SupplierSelector.select_best_supplier([ps])
        assert result.supplier_name == "Only"
