
from app.exceptions.custom_exceptions import InvalidWeightageException
class WeightValidator:
    """
    Validates AI-generated weight distributions.
    """

    REQUIRED_KEYS = [
        "sales_volume_weight",
        "lead_time_weight",
        "supplier_quality_weight",
        "popularity_weight",
        "weather_weight",
        "festival_demand_weight",
        "durability_weight",
        "expiry_weight",
    ]

    @staticmethod
    def validate(weights: dict):
        """
        Validate AI-generated weights.
        """

        # Check required keys
        for key in WeightValidator.REQUIRED_KEYS:
            if key not in weights:
                raise ValueError(
                    f"Missing weight: {key}"
                )

        # Check values
        for key, value in weights.items():
            if not isinstance(value, (int, float)):
                raise ValueError(
                    f"{key} must be numeric."
                )

            if value < 0 or value > 1:
                raise ValueError(
                    f"{key} must be between 0 and 1."
                )

        total = sum(weights.values())

        if round(total, 2) != 1.00:
            raise InvalidWeightageException(total)

        return True