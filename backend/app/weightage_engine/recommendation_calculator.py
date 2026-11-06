"""
RecommendationCalculator — normalised, dimensionally-consistent scoring.

All eight factors are normalised to a 0–100 scale before being combined
with their respective weights. The final score is guaranteed to remain in the
0–100 range (weights must sum to 1.0, validated by WeightValidator).

Factor normalisation interpretations:
1. sales_volume     – higher daily sales velocity → higher urgency → higher score (0–100)
2. lead_time        – longer supplier lead time   → higher replenishment risk → higher score (0–100)
3. supplier_quality – higher supplier reliability → higher fulfillment confidence → higher score (0–100)
4. popularity       – higher customer rating/popularity → higher demand pressure → higher score (0–100)
5. weather_demand   – heuristic seasonal multiplier by category & calendar month (0–100)
6. festival_demand  – proximity to known festival calendar, filtered by category relevance (0–100)
7. durability       – shorter durability (more perishable) → higher turnover needed → higher score (0–100)
8. expiry_risk      – closer to expiration date → urgent replacement needed → higher score (0–100)

Note on Weather & Festival Data:
These values are heuristic models based on calendar dates and product category
affinities. They represent contextual demand multipliers, not live meteorological
telemetry.
"""

from collections import defaultdict
from datetime import date, timedelta
from typing import Optional


# ── Seasonal demand multipliers (0–100) ─────────────────────────────────────
_SEASON_BY_MONTH = {
    1: "winter", 2: "winter", 3: "spring",
    4: "spring", 5: "spring", 6: "summer",
    7: "summer", 8: "summer", 9: "autumn",
    10: "autumn", 11: "autumn", 12: "winter",
}

_SEASONAL_MULTIPLIERS = {
    "summer": {
        "beverage": 90, "drink": 90, "ice": 90, "cold": 85,
        "clothing": 60, "apparel": 60, "electronics": 50,
        "heater": 10, "blanket": 15,
    },
    "winter": {
        "heater": 90, "blanket": 85, "clothing": 75, "apparel": 70,
        "beverage": 50, "electronics": 60, "cold": 20,
    },
    "spring": {
        "clothing": 65, "apparel": 65, "electronics": 55,
    },
    "autumn": {
        "clothing": 60, "apparel": 60, "electronics": 55,
    },
}

# Categories with meaningful festival demand spikes
_FESTIVAL_RELEVANT_CATEGORIES = {
    "apparel", "clothing", "fashion", "dress",
    "gifts", "gift", "sweets", "sweet", "confectionery",
    "decorations", "decoration", "electronics", "toys",
    "jewelry", "food", "snack",
}

# Known festival calendar (month, day-start, month, day-end)
_FESTIVAL_PERIODS = [
    (10, 10, 11, 10),   # Diwali season (Oct–Nov)
    (12, 15, 1, 5),     # Christmas / New Year
    (3, 1, 3, 31),      # Holi / Spring festivals
    (8, 15, 9, 15),     # Independence / Onam season
    (4, 1, 4, 30),      # Easter / Eid season
]


class RecommendationCalculator:
    """
    Calculates a normalised recommendation score (0–100) for a product.
    """

    # Configurable reference constants
    MAX_DAILY_SALES_REFERENCE: float = 100.0   # units/day considered maximum reference velocity
    MAX_LEAD_TIME_DAYS: float = 60.0          # days beyond which lead time urgency saturates at 100
    MAX_POPULARITY_SCORE: float = 10.0        # scale of popularity_score in Sales records
    OBSERVATION_DAYS: int = 90                # default historical observation window

    @staticmethod
    def calculate(
        product,
        inventory,
        sales: list,
        suppliers: list,
        weights: dict,
        as_of_date: Optional[date] = None
    ) -> float:
        """
        Returns a normalised recommendation score in the range 0.0 – 100.0.

        Parameters
        ----------
        product    : Product ORM object
        inventory  : Inventory ORM object (may be None)
        sales      : list of Sale ORM objects
        suppliers  : list of ProductSupplier ORM objects
        weights    : dict with eight weight keys summing to 1.0
        as_of_date : date, optional (defaults to date.today())
        """
        if as_of_date is None:
            as_of_date = date.today()

        category = (getattr(product, "category", "") or "").lower()

        # ── 1. Sales Volume (0–100) ──────────────────────────────────────────
        avg_daily = RecommendationCalculator._compute_avg_daily_sales(
            sales=sales,
            observation_days=RecommendationCalculator.OBSERVATION_DAYS,
            as_of_date=as_of_date,
            product_created_at=getattr(product, "created_at", None)
        )
        sales_volume_score = min(avg_daily / RecommendationCalculator.MAX_DAILY_SALES_REFERENCE, 1.0) * 100.0

        # ── 2. Lead Time (0–100) ─────────────────────────────────────────────
        lead_time_days = RecommendationCalculator._get_best_lead_time(suppliers)
        lead_time_score = min(lead_time_days / RecommendationCalculator.MAX_LEAD_TIME_DAYS, 1.0) * 100.0

        # ── 3. Supplier Quality (0–100) ──────────────────────────────────────
        # Higher supplier quality indicates higher replenishment confidence/viability
        quality = RecommendationCalculator._get_best_quality(suppliers)
        supplier_quality_score = max(0.0, min(quality * 100.0, 100.0))

        # ── 4. Popularity (0–100) ────────────────────────────────────────────
        avg_pop = RecommendationCalculator._avg_popularity(sales)
        popularity_score = min(avg_pop / RecommendationCalculator.MAX_POPULARITY_SCORE, 1.0) * 100.0

        # ── 5. Weather Demand (0–100) ────────────────────────────────────────
        weather_score = RecommendationCalculator._get_seasonal_factor(category, as_of_date=as_of_date)

        # ── 6. Festival Demand (0–100) ───────────────────────────────────────
        festival_score = RecommendationCalculator._get_festival_factor(category, as_of_date=as_of_date)

        # ── 7. Durability (0–100) ────────────────────────────────────────────
        # Shorter durability → more perishable → higher urgency to replenish fresh units
        dur = getattr(product, "durability_days", None)
        if dur is None:
            durability_score = 50.0  # neutral
        else:
            dur_float = float(dur)
            if dur_float <= 0:
                durability_score = 100.0
            elif dur_float >= 365.0:
                durability_score = 0.0
            else:
                durability_score = max(0.0, min(100.0 - (dur_float / 365.0 * 100.0), 100.0))

        # ── 8. Expiry Risk (0–100) ───────────────────────────────────────────
        expiry_date = getattr(product, "expiry_date", None)
        if expiry_date is None:
            expiry_risk_score = 0.0  # non-perishable → no expiry risk
        else:
            if hasattr(expiry_date, "date"):
                expiry_date = expiry_date.date()
            if expiry_date <= as_of_date:
                expiry_risk_score = 100.0  # already expired → urgent stock replacement
            else:
                days_left = (expiry_date - as_of_date).days
                if days_left < 7:
                    expiry_risk_score = 95.0
                elif days_left < 30:
                    expiry_risk_score = 75.0
                elif days_left < 90:
                    expiry_risk_score = 50.0
                elif days_left < 180:
                    expiry_risk_score = 25.0
                else:
                    expiry_risk_score = 10.0

        # ── Weighted sum ─────────────────────────────────────────────────────
        factor_values = [
            sales_volume_score,
            lead_time_score,
            supplier_quality_score,
            popularity_score,
            weather_score,
            festival_score,
            durability_score,
            expiry_risk_score,
        ]
        weight_keys = [
            "sales_volume_weight",
            "lead_time_weight",
            "supplier_quality_weight",
            "popularity_weight",
            "weather_weight",
            "festival_demand_weight",
            "durability_weight",
            "expiry_weight",
        ]
        score = sum(
            factor_values[i] * max(0.0, float(weights.get(weight_keys[i], 0.0)))
            for i in range(len(weight_keys))
        )

        # Enforce range [0.0, 100.0]
        return round(min(max(score, 0.0), 100.0), 2)

    # ── Private helpers ───────────────────────────────────────────────────────

    @staticmethod
    def _compute_avg_daily_sales(
        sales: list,
        observation_days: int = 90,
        as_of_date: Optional[date] = None,
        product_created_at = None
    ) -> float:
        """
        Groups sales records by calendar date, sums quantity per day, and divides
        by the effective calendar days in the observation window.
        Strictly excludes future-dated sales.
        """
        if as_of_date is None:
            as_of_date = date.today()
        elif hasattr(as_of_date, "date"):
            as_of_date = as_of_date.date()
        elif isinstance(as_of_date, str):
            try:
                as_of_date = datetime.fromisoformat(as_of_date).date()
            except Exception:
                as_of_date = date.today()

        window_start = as_of_date - timedelta(days=observation_days - 1)

        if not sales:
            return 0.0

        daily: dict = defaultdict(int)
        for sale in sales:
            s_date = getattr(sale, "sale_date", None)
            if s_date is None:
                continue
            if hasattr(s_date, "date"):
                s_date = s_date.date()
            elif isinstance(s_date, str):
                try:
                    s_date = datetime.fromisoformat(s_date).date()
                except Exception:
                    continue
            # Strictly filter within observation window, exclude future
            if s_date > as_of_date or s_date < window_start:
                continue
            daily[s_date] += int(getattr(sale, "quantity_sold", 0) or 0)

        total_qty = sum(daily.values())
        if total_qty <= 0:
            return 0.0

        effective_days = observation_days
        if product_created_at is not None:
            c_date = product_created_at
            if hasattr(c_date, "date"):
                c_date = c_date.date()
            elif isinstance(c_date, str):
                try:
                    c_date = datetime.fromisoformat(c_date).date()
                except Exception:
                    c_date = None
            if c_date and c_date > window_start and c_date <= as_of_date:
                effective_days = max(1, (as_of_date - c_date).days + 1)

        return total_qty / max(1, effective_days)

    @staticmethod
    def _get_best_lead_time(suppliers: list) -> float:
        """Returns the shortest lead time among eligible suppliers."""
        lead_times = []
        for ps in suppliers:
            s = getattr(ps, "supplier", None)
            if s and getattr(s, "lead_time_days", None) is not None:
                lead_times.append(float(s.lead_time_days))
        return min(lead_times) if lead_times else 7.0  # neutral default

    @staticmethod
    def _get_best_quality(suppliers: list) -> float:
        """Returns the highest quality score among available suppliers (0.0 to 1.0)."""
        qualities = []
        for ps in suppliers:
            s = getattr(ps, "supplier", None)
            if s and getattr(s, "quality_score", None) is not None:
                qualities.append(float(s.quality_score))
        return max(qualities) if qualities else 0.50  # neutral mid-point

    @staticmethod
    def _avg_popularity(sales: list) -> float:
        """Returns average popularity_score from sales records."""
        scores = [
            float(s.popularity_score)
            for s in sales
            if getattr(s, "popularity_score", None) is not None
        ]
        return (sum(scores) / len(scores)) if scores else 5.0

    @staticmethod
    def _get_seasonal_factor(category: str, as_of_date: Optional[date] = None) -> float:
        """
        Returns seasonal demand factor (0–100) based on category affinity.
        """
        if as_of_date is None:
            as_of_date = date.today()

        season = _SEASON_BY_MONTH.get(as_of_date.month, "spring")
        season_map = _SEASONAL_MULTIPLIERS.get(season, {})
        for keyword, score in season_map.items():
            if keyword in category:
                return float(score)
        return 50.0

    @staticmethod
    def _get_festival_factor(category: str = "", as_of_date: Optional[date] = None) -> float:
        """
        Returns festival demand factor (0–100).
        If category is not festival-relevant, returns neutral baseline (30.0).
        """
        is_relevant = any(c in category for c in _FESTIVAL_RELEVANT_CATEGORIES)
        if not is_relevant:
            return 30.0

        if as_of_date is None:
            as_of_date = date.today()

        min_days_to_festival = None
        for (sm, sd, em, ed) in _FESTIVAL_PERIODS:
            for year_offset in (0, 1):
                try:
                    fest_start = date(as_of_date.year + year_offset, sm, sd)
                    fest_end = date(as_of_date.year + year_offset, em, ed)
                    if fest_end < fest_start:
                        fest_end = date(as_of_date.year + year_offset + 1, em, ed)
                    days_to_start = (fest_start - as_of_date).days
                    if fest_start <= as_of_date <= fest_end:
                        return 90.0  # active festival period
                    if days_to_start >= 0:
                        if min_days_to_festival is None or days_to_start < min_days_to_festival:
                            min_days_to_festival = days_to_start
                        break
                except ValueError:
                    continue

        if min_days_to_festival is None:
            return 30.0
        if min_days_to_festival <= 30:
            return 80.0
        if min_days_to_festival <= 60:
            return 60.0
        return 30.0
