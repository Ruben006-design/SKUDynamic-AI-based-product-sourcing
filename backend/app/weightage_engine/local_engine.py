"""
LocalWeightageEngine — data-driven, deterministic weight generation.

No external API required. Weights are derived from product characteristics
and historical data using transparent statistical signal analysis.

Methodology
-----------
For each of the eight factors, an independent business signal is computed:

1. Sales Volume Weight:
   Reflects demand velocity (throughput volume). High-velocity items must have
   replenishment decisions dominated by sales movement to avoid stockouts.
   Formula: Volume Signal = base 0.20 + min(avg_daily / 50.0, 1.0) * 0.15

2. Lead Time Weight:
   Long replenishment lead times create extended exposure to supply risk.
   Formula: Lead Time Signal = base 0.05 + min(lead_time_days / 60.0, 1.0) * 0.15

3. Supplier Quality Weight:
   Measures supply consistency and fulfillment reliability. Lower or volatile
   quality demands higher monitoring weight.
   Formula: Quality Signal = base 0.05 + (1.0 - quality_score) * 0.15

4. Popularity Weight:
   Reflects market reputation and customer demand pressure.
   Formula: Popularity Signal = base 0.05 + (avg_popularity / 10.0) * 0.10

5. Weather Demand Weight:
   Reflects seasonal weather sensitivity (e.g., beverages in summer, heaters in winter).
   Formula: Weather Signal = 0.12 if category is seasonal, else 0.05

6. Festival Demand Weight:
   Reflects cultural/event demand surges for relevant categories (apparel, sweets, gifts).
   Formula: Festival Signal = 0.12 if category is festival-sensitive, else 0.05

7. Durability Weight:
   Short durability items require frequent, smaller orders to maintain freshness.
   Formula: Durability Signal = 0.20 for short durability (<30d), scaled down to 0.05 for >365d

8. Expiry Weight:
   Perishable items facing spoilage risk shift significant weight to shelf-life management.
   Formula: Expiry Signal = 0.20 if perishable category or expiry date exists, else 0.05

Demand Variability (CV):
   Demand variability (CV = std_dev / mean) is treated as a separate signal.
   High variability indicates volatile demand patterns requiring a higher safety stock
   buffer and increased emphasis on lead time and sales volume signals.

Profiles Supported:
- Profile 1: High-Velocity Perishable (e.g., Dairy, Fresh Produce, Bakery)
- Profile 2: Seasonal & Festival Apparel (e.g., Festival Wear, Winter Clothing)
- Profile 3: Slow-Moving Industrial Hardware (e.g., Machine Spares, Tools)
"""

import logging
from collections import defaultdict
from datetime import date, timedelta
from typing import Optional

logger = logging.getLogger(__name__)


class LocalWeightageEngine:
    """
    Generates product-specific factor weights using local statistical signals.
    Guarantees weights sum to exactly 1.0.
    """

    # Perishable goods category keywords
    PERISHABLE_CATEGORIES = {
        "food", "beverage", "dairy", "produce", "bakery",
        "meat", "seafood", "frozen", "pharmacy", "cosmetics",
        "drink", "juice", "milk", "bread", "snack",
    }

    # Seasonal and festival goods category keywords
    SEASONAL_CATEGORIES = {
        "clothing", "apparel", "gifts", "decorations", "fireworks",
        "sweets", "electronics", "toys", "fashion", "seasonal",
    }

    @staticmethod
    def generate_weights(
        product,
        inventory,
        sales: list,
        product_suppliers: list,
        human_evaluations: list = None,
        as_of_date: Optional[date] = None
    ) -> dict:
        """
        Generates product-specific factor weights based on data signals.

        Returns a dictionary with 8 keys summing to exactly 1.0:
            sales_volume_weight, lead_time_weight, supplier_quality_weight,
            popularity_weight, weather_weight, festival_demand_weight,
            durability_weight, expiry_weight
        """
        if as_of_date is None:
            as_of_date = date.today()

        category_lower = (getattr(product, "category", "") or "").lower()
        is_perishable = any(
            c in category_lower for c in LocalWeightageEngine.PERISHABLE_CATEGORIES
        )
        is_seasonal = any(
            c in category_lower for c in LocalWeightageEngine.SEASONAL_CATEGORIES
        )

        avg_daily, cv, trend = LocalWeightageEngine._sales_stats(
            sales=sales,
            as_of_date=as_of_date,
            product_created_at=getattr(product, "created_at", None)
        )
        lead_time = LocalWeightageEngine._get_best_lead_time(product_suppliers)
        quality = LocalWeightageEngine._get_best_quality(product_suppliers)
        avg_pop = LocalWeightageEngine._avg_popularity(sales)

        signals = {}

        # 1. Sales Volume (Velocity): higher throughput → higher weight on volume
        # Baseline 0.20 + up to 0.15 based on daily volume velocity
        signals["sales_volume_weight"] = 0.20 + min(avg_daily / 50.0, 1.0) * 0.15

        # 2. Lead Time: longer lead time → higher replenishment risk
        signals["lead_time_weight"] = 0.05 + min(lead_time / 60.0, 1.0) * 0.15

        # 3. Supplier Quality: lower quality → greater need to monitor supplier risk
        signals["supplier_quality_weight"] = 0.05 + (1.0 - quality) * 0.15

        # 4. Popularity: customer demand pressure
        signals["popularity_weight"] = 0.05 + (avg_pop / 10.0) * 0.10

        # 5. Weather Demand: category sensitivity to weather
        signals["weather_weight"] = 0.12 if is_seasonal else 0.05

        # 6. Festival Demand: category sensitivity to festival periods
        signals["festival_demand_weight"] = 0.12 if is_seasonal else 0.05

        # 7. Durability: short durability items need high attention to shelf-life
        dur = getattr(product, "durability_days", None)
        if dur is None:
            dur_signal = 0.10
        else:
            dur_float = float(dur)
            dur_signal = max(0.05, 0.20 - (dur_float / 365.0) * 0.15)
        signals["durability_weight"] = dur_signal

        # 8. Expiry Risk: perishable goods or products with expiry dates
        if is_perishable or getattr(product, "expiry_date", None):
            signals["expiry_weight"] = 0.20
        else:
            signals["expiry_weight"] = 0.05

        # Adjust for demand variability (CV):
        # If demand is highly erratic (CV > 1.0), boost sales volume and lead time signals
        if cv > 1.0:
            signals["sales_volume_weight"] += 0.05
            signals["lead_time_weight"] += 0.05

        # Normalise to sum = exactly 1.0
        total = sum(signals.values())
        if total <= 0:
            n = len(signals)
            return {k: round(1.0 / n, 4) for k in signals}

        normalized = {k: round(v / total, 4) for k, v in signals.items()}

        # Correct floating-point rounding drift on the highest weight
        diff = round(1.0 - sum(normalized.values()), 4)
        if diff != 0:
            max_key = max(normalized, key=lambda k: normalized[k])
            normalized[max_key] = round(normalized[max_key] + diff, 4)

        return normalized

    @staticmethod
    def generate_explanation(weights: dict, product) -> str:
        """
        Returns a human-readable explanation of the generated weights.
        """
        p_name = getattr(product, "product_name", "Product")
        lines = [f"Deterministic weight distribution for '{p_name}':"]
        for key, val in weights.items():
            factor = key.replace("_weight", "").replace("_", " ").title()
            lines.append(f"  {factor}: {val:.4f} ({val * 100:.1f}%)")
        return " | ".join(lines)

    # ── Private helpers ────────────────────────────────────────────────────────

    @staticmethod
    def _sales_stats(
        sales: list,
        observation_days: int = 90,
        as_of_date: Optional[date] = None,
        product_created_at = None
    ) -> tuple[float, float, float]:
        """
        Calculates:
        1. avg_daily_sales (calendar-day based throughput)
        2. coefficient_of_variation (demand variability: std_dev / mean)
        3. trend_ratio (recent 30-day velocity / full 90-day velocity)
        """
        if as_of_date is None:
            as_of_date = date.today()

        window_start = as_of_date - timedelta(days=observation_days)
        recent_30d_start = as_of_date - timedelta(days=30)

        if not sales:
            return 0.0, 0.0, 1.0

        daily: dict = defaultdict(int)
        recent_daily: dict = defaultdict(int)

        for s in sales:
            s_date = getattr(s, "sale_date", None)
            if s_date is None:
                continue
            if hasattr(s_date, "date"):
                s_date = s_date.date()
            if s_date > as_of_date or s_date < window_start:
                continue
            qty = int(getattr(s, "quantity_sold", 0) or 0)
            daily[s_date] += qty
            if s_date >= recent_30d_start:
                recent_daily[s_date] += qty

        total_qty = sum(daily.values())
        if total_qty <= 0:
            return 0.0, 0.0, 1.0

        effective_days = observation_days
        if product_created_at is not None:
            c_date = product_created_at
            if hasattr(c_date, "date"):
                c_date = c_date.date()
            if c_date and c_date > window_start and c_date <= as_of_date:
                effective_days = max(1, (as_of_date - c_date).days + 1)

        avg_daily = total_qty / max(1, effective_days)

        # Standard deviation across calendar days (including zero-sales days)
        # Number of zero days in effective window = effective_days - len(daily)
        zero_days = max(0, effective_days - len(daily))
        sum_sq_diff = sum((qty - avg_daily) ** 2 for qty in daily.values()) + zero_days * ((0 - avg_daily) ** 2)
        variance = sum_sq_diff / max(1, effective_days)
        std_dev = variance ** 0.5
        cv = (std_dev / avg_daily) if avg_daily > 0 else 0.0

        # Demand trend: recent 30d velocity vs overall 90d velocity
        recent_days = min(30, effective_days)
        recent_avg = sum(recent_daily.values()) / max(1, recent_days)
        trend_ratio = (recent_avg / avg_daily) if avg_daily > 0 else 1.0

        return avg_daily, cv, trend_ratio

    @staticmethod
    def _get_best_lead_time(product_suppliers: list) -> float:
        """Returns the shortest lead time among all linked suppliers."""
        lead_times = []
        for ps in product_suppliers:
            s = getattr(ps, "supplier", None)
            if s and getattr(s, "lead_time_days", None) is not None:
                lead_times.append(float(s.lead_time_days))
        return min(lead_times) if lead_times else 7.0

    @staticmethod
    def _get_best_quality(product_suppliers: list) -> float:
        """Returns the highest quality score among all linked suppliers."""
        qualities = []
        for ps in product_suppliers:
            s = getattr(ps, "supplier", None)
            if s and getattr(s, "quality_score", None) is not None:
                qualities.append(float(s.quality_score))
        return max(qualities) if qualities else 0.75

    @staticmethod
    def _avg_popularity(sales: list) -> float:
        """Returns the average popularity_score from sales records."""
        scores = [
            float(s.popularity_score)
            for s in sales
            if getattr(s, "popularity_score", None) is not None
        ]
        return (sum(scores) / len(scores)) if scores else 5.0
