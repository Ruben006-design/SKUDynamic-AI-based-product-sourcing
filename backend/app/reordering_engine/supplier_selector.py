"""
SupplierSelector — multi-criteria best-supplier selection.

Scoring rubric (total up to 100 points):
  is_preferred    : +40 bonus if True
  quality_score   : 0–30 points  (quality_score × 30, where quality_score ∈ [0,1])
  lead_time_days  : 0–20 points  (shorter lead time = more points)
  negotiated_price: 0–10 points  (cheaper supplier gets more points via min-max scaling)

Contract validity:
  Suppliers whose contract_end date is in the past (< today) are strictly excluded.
"""

from datetime import date
from typing import Optional


class SupplierSelector:
    """
    Handles supplier selection for product reordering using multi-criteria optimization.
    """

    @staticmethod
    def select_best_supplier(product_suppliers: list) -> Optional[object]:
        """
        Selects the best supplier using multi-criteria scoring.

        Parameters
        ----------
        product_suppliers : list of ProductSupplier ORM objects
            Each has a `.supplier` relationship, `.is_preferred`, `.negotiated_price`,
            `.contract_end`.

        Returns
        -------
        The Supplier object with the highest score, or None if no eligible supplier exists.
        """
        if not product_suppliers:
            return None

        today = date.today()

        # Filter: skip suppliers with expired contracts or missing supplier records
        eligible = []
        for ps in product_suppliers:
            supplier = getattr(ps, "supplier", None)
            if supplier is None:
                continue

            contract_end = getattr(ps, "contract_end", None)
            if contract_end is not None:
                if hasattr(contract_end, "date"):
                    contract_end = contract_end.date()
                if contract_end < today:
                    continue  # contract expired — exclude

            eligible.append(ps)

        if not eligible:
            return None

        # Collect valid negotiated_price values for relative price scoring
        valid_prices = [
            float(ps.negotiated_price)
            for ps in eligible
            if getattr(ps, "negotiated_price", None) is not None
            and float(ps.negotiated_price) > 0
        ]
        min_p = min(valid_prices) if valid_prices else 0.0
        max_p = max(valid_prices) if valid_prices else 0.0

        def _score(ps) -> float:
            s = ps.supplier
            total = 0.0

            # 1. Preferred supplier status (+40 points)
            if getattr(ps, "is_preferred", False):
                total += 40.0

            # 2. Quality score: 0–30 points (quality_score is on 0.0–1.0 scale)
            q = float(getattr(s, "quality_score", 0.0) or 0.0)
            total += min(max(q, 0.0), 1.0) * 30.0

            # 3. Lead time: 0–20 points (shorter is better; 0 days = 20 pts, >= 60 days = 0 pts)
            lt = float(getattr(s, "lead_time_days", 60.0) or 60.0)
            total += max(0.0, 20.0 - (lt / 60.0) * 20.0)

            # 4. Negotiated price: 0–10 points (lowest price gets 10 pts, highest gets 0 pts)
            p = getattr(ps, "negotiated_price", None)
            if p is not None and max_p > min_p:
                price_val = float(p)
                # Linear min-max inverse interpolation
                price_ratio = (price_val - min_p) / (max_p - min_p)
                total += max(0.0, min(10.0, (1.0 - price_ratio) * 10.0))
            elif p is not None:
                # All candidates have identical price or single supplier
                total += 10.0
            else:
                # Missing price info: neutral default
                total += 5.0

            return total

        best_ps = max(eligible, key=_score)
        return best_ps.supplier
