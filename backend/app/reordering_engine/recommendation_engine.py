from app.reordering_engine.reorder_calculator import (
    ReorderCalculator
)
from app.reordering_engine.supplier_selector import (
    SupplierSelector
)


class RecommendationEngine:
    """
    Generates reorder recommendations for a product.
    """

    @staticmethod
    def generate_recommendation(
        product,
        inventory,
        weightage,
        suppliers,
        average_daily_sales
    ):
        """
        Generates a reorder recommendation for a single product.
        """

        supplier_objects = [
            ps.supplier
            for ps in suppliers
            if ps.supplier is not None
        ]

        best_supplier = (
            SupplierSelector.select_best_supplier(
                supplier_objects
            )
        )

        reorder_required = (
            ReorderCalculator.should_reorder(
                recommendation_score=weightage.recommendation_score,
                current_stock=inventory.current_stock,
                reorder_point=inventory.reorder_point
            )
        )

        reorder_quantity = 0

        if reorder_required:

            lead_time_days = 0

            if (
                best_supplier is not None and
                best_supplier.lead_time_days is not None
            ):
                lead_time_days = int(
                    best_supplier.lead_time_days
                )

            reorder_quantity = (
                ReorderCalculator.calculate_reorder_quantity(
                    average_daily_sales=average_daily_sales,
                    lead_time_days=lead_time_days
                )
            )

        return {
            "product": product,
            "weightage": weightage,
            "supplier": best_supplier,
            "reorder_required": reorder_required,
            "reorder_quantity": reorder_quantity
        }