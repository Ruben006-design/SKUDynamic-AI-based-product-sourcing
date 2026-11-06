"""
Tests for WeightValidator.
"""

import pytest
from app.weightage_engine.validator import WeightValidator


VALID_WEIGHTS = {
    "sales_volume_weight": 0.20,
    "lead_time_weight": 0.15,
    "supplier_quality_weight": 0.15,
    "popularity_weight": 0.10,
    "weather_weight": 0.10,
    "festival_demand_weight": 0.10,
    "durability_weight": 0.10,
    "expiry_weight": 0.10,
}  # sum = 1.00


class TestWeightValidator:
    def test_valid_weights_pass(self):
        # Should not raise
        WeightValidator.validate(VALID_WEIGHTS)

    def test_weights_not_summing_to_1_raises(self):
        bad = dict(VALID_WEIGHTS)
        bad["sales_volume_weight"] = 0.50  # now sum > 1
        with pytest.raises(Exception):
            WeightValidator.validate(bad)

    def test_negative_weight_raises(self):
        bad = dict(VALID_WEIGHTS)
        bad["expiry_weight"] = -0.10
        # Adjust another to keep sum at 1
        bad["sales_volume_weight"] = 0.30
        with pytest.raises(Exception):
            WeightValidator.validate(bad)

    def test_missing_key_raises(self):
        bad = dict(VALID_WEIGHTS)
        del bad["expiry_weight"]
        with pytest.raises(Exception):
            WeightValidator.validate(bad)
