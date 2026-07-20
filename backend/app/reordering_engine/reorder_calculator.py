import math


class ReorderCalculator:
    """
    Handles reorder decision and quantity calculation.
    """
    @staticmethod
    def should_reorder(
        recommendation_score: float,
        current_stock: int,
        reorder_point: int | None
    ) -> bool:
        """
        Determines whether a product should be reordered.

        Reorder if:
        1. Stock reaches reorder point, OR
        2. AI recommendation score predicts high demand.
        """

        if reorder_point is None:
            return recommendation_score >= 55

        return (
            current_stock <= reorder_point
            or recommendation_score >= 55
        )
    @staticmethod
    def calculate_reorder_quantity(
        average_daily_sales: float,
        lead_time_days: int,
        safety_stock: int = 10
    ) -> int:
        """
        Calculates the recommended reorder quantity.

        Formula:
            (Average Daily Sales × Lead Time)
            + Safety Stock
        """

        quantity = (
            average_daily_sales * lead_time_days
        ) + safety_stock

        return max(0, math.ceil(quantity))