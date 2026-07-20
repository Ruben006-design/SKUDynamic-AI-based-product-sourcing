from typing import List, Optional


class SupplierSelector:
    """
    Handles supplier selection for product reordering.
    """

    @staticmethod
    def select_best_supplier(
        suppliers: List
    ) -> Optional:
        """
        Selects the best supplier for a product.

        Current strategy:
        1. Highest supplier rating.
        2. If ratings are equal, lowest lead time.
        """

        if not suppliers:
            return None

        return sorted(
            suppliers,
            key=lambda supplier: (
                -(supplier.quality_score or 0),
                supplier.lead_time_days or 999
            )
        )[0]