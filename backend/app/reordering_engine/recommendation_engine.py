from app.reordering_engine.reorder_calculator import (
    ReorderCalculator
)
from app.reordering_engine.supplier_selector import (
    SupplierSelector
)


class RecommendationEngine:
    """
    Generates reorder recommendations for a product using inventory position
    and multi-criteria supplier selection.
    """

    @staticmethod
    def generate_recommendation(
        product,
        inventory,
        weightage,
        suppliers,
        average_daily_sales: float,
        safety_stock: int = 0,
        pending_order_qty: int = 0,
        backorders: int = 0
    ):
        """
        Generates a reorder recommendation for a single product.

        Parameters
        ----------
        product             : Product ORM object
        inventory           : Inventory ORM object
        weightage           : Weightage ORM object
        suppliers           : list of ProductSupplier ORM objects
        average_daily_sales : float  – pre-computed average daily sales (90-day window)
        safety_stock        : int    – from Inventory.safety_stock (DB value)
        pending_order_qty   : int    – total quantity on active (pending/approved/ordered) orders
        backorders          : int    – outstanding unfulfilled demand (defaults to 0, not in schema)
        """

        best_supplier = SupplierSelector.select_best_supplier(suppliers)

        lead_time_days = 0
        if (
            best_supplier is not None and
            best_supplier.lead_time_days is not None
        ):
            lead_time_days = int(best_supplier.lead_time_days)

        current_stock = int(inventory.current_stock or 0)
        reorder_point = inventory.reorder_point

        # Calculate exact reorder quantity using Inventory Position = On-Hand + On-Order - Backorders
        reorder_quantity = ReorderCalculator.calculate_reorder_quantity(
            current_stock=current_stock,
            average_daily_sales=average_daily_sales,
            lead_time_days=lead_time_days,
            safety_stock=safety_stock,
            on_order_qty=pending_order_qty,
            backorders=backorders
        )

        # Consistent decision logic: inventory position breached or AI score >= 55, AND units are needed
        reorder_required = ReorderCalculator.should_reorder(
            recommendation_score=weightage.recommendation_score,
            current_stock=current_stock,
            reorder_point=reorder_point,
            on_order_qty=pending_order_qty,
            backorders=backorders,
            reorder_quantity=reorder_quantity
        )

        return {
            "product": product,
            "weightage": weightage,
            "supplier": best_supplier,
            "reorder_required": reorder_required,
            "reorder_quantity": reorder_quantity if reorder_required else 0
        }
