import logging
from collections import defaultdict
from datetime import date, datetime, timedelta

from sqlalchemy.orm import Session

from app.exceptions.custom_exceptions import (
    RetailerNotFoundException
)
from app.reordering_engine.recommendation_engine import (
    RecommendationEngine
)
from app.reordering_engine.schemas import (
    ReorderRecommendation,
    ReorderingResponse
)
from app.weightage.repository import (
    WeightageRepository
)
from app.retailer.repository import (
    RetailerRepository
)
from app.product.repository import (
    ProductRepository
)
from app.inventory.repository import (
    InventoryRepository
)
from app.sales.repository import (
    SalesRepository
)
from app.product_supplier.repository import (
    ProductSupplierRepository
)
from app.order_list.repository import (
    OrderListRepository
)
from app.order_list.schemas import (
    OrderListCreate
)

logger = logging.getLogger(__name__)


class ReorderingEngineService:
    """
    Handles AI-based product reordering workflow using Inventory Position
    and Target Stock (Order-Up-To Level) logic.
    """

    @staticmethod
    def _compute_avg_daily_sales(
        sales_history: list,
        observation_days: int = 90,
        as_of_date: date | None = None,
        product_created_at = None
    ) -> float:
        """
        Computes average daily demand:
        1. Filters sales strictly to the observation window [as_of_date - observation_days, as_of_date].
        2. Strictly excludes future-dated transactions (> as_of_date).
        3. Aggregates multiple transactions on the same calendar day.
        4. Accurately determines the effective calendar days denominator:
           - If product was introduced less than observation_days ago, uses
             actual active days = (as_of_date - created_date).days + 1 to avoid artificial demand dilution.
           - Otherwise uses full observation_days (including zero-sales calendar days).
        5. Returns 0.0 if no sales exist.
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

        if not sales_history:
            return 0.0

        daily: dict = defaultdict(int)
        for sale in sales_history:
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
    def _build_justification(
        product,
        inventory,
        average_daily_sales: float,
        reorder_quantity: int,
        supplier,
        score: float,
        reorder_required: bool,
        pending_order_qty: int = 0
    ) -> str:
        """
        Generates a transparent, human-readable justification string explaining
        inventory position, daily demand, lead time, safety stock, and AI score.
        """
        action = "Reorder recommended" if reorder_required else "No reorder needed"
        stock = int(getattr(inventory, "current_stock", 0) or 0)
        reorder_pt = getattr(inventory, "reorder_point", None)
        safety_st = int(getattr(inventory, "safety_stock", 0) or 0)
        inv_position = stock + pending_order_qty

        parts = [
            f"{action}.",
            f"On-hand stock: {stock} units, on-order: {pending_order_qty} units (inventory position: {inv_position})"
            + (f", reorder point: {reorder_pt}" if reorder_pt is not None else "") + ".",
            f"Avg daily demand (90-day): {average_daily_sales:.2f} units/day.",
        ]

        if reorder_required and reorder_quantity > 0:
            parts.append(f"Suggested order quantity: {reorder_quantity} units.")

        if supplier:
            q = float(getattr(supplier, "quality_score", 0) or 0)
            lt = int(getattr(supplier, "lead_time_days", 0) or 0)
            s_name = getattr(supplier, "supplier_name", "Supplier")
            parts.append(
                f"Selected supplier: {s_name} "
                f"(quality: {q:.2f}, lead time: {lt} days)."
            )

        parts.append(f"Safety stock: {safety_st} units.")
        parts.append(f"AI recommendation score: {float(score):.1f}/100.")

        return " ".join(parts)

    @staticmethod
    def _generate_recommendation_for_product(
        db: Session,
        retailer,
        config_id: int,
        product
    ):
        """
        Generate reorder recommendation for a single product.
        """
        weightage = WeightageRepository.get_by_product_and_config(
            db,
            product.product_id,
            config_id
        )

        if weightage is None:
            raise ValueError(
                f"No weightage found for product {product.product_id}"
            )

        inventory = InventoryRepository.get_by_product_id(
            db,
            product.product_id
        )

        if inventory is None:
            raise ValueError(
                f"No inventory found for product {product.product_id}"
            )

        today = date.today()
        # 90 calendar days inclusive: [today - 89, today]
        from_date = today - timedelta(days=89)
        sales_history = SalesRepository.get_sales_history(
            db,
            product_id=product.product_id,
            from_date=from_date,
            to_date=today
        )

        # Average daily demand calculated over calendar days in observation window
        average_daily_sales = ReorderingEngineService._compute_avg_daily_sales(
            sales_history=sales_history,
            observation_days=90,
            as_of_date=today,
            product_created_at=getattr(product, "created_at", None)
        )

        suppliers = ProductSupplierRepository.get_by_product_id(
            db,
            product.product_id
        )

        safety_stock = int(getattr(inventory, "safety_stock", 0) or 0)

        # Total on-order quantity (pending + approved + ordered)
        pending_qty = OrderListRepository.get_pending_quantity_for_product(
            db,
            product.product_id,
            retailer.retailer_id
        )

        recommendation = RecommendationEngine.generate_recommendation(
            product=product,
            inventory=inventory,
            weightage=weightage,
            suppliers=suppliers,
            average_daily_sales=average_daily_sales,
            safety_stock=safety_stock,
            pending_order_qty=pending_qty
        )

        supplier = recommendation["supplier"]

        logger.info(
            "Product %s | Stock: %s | On-Order: %s | Score: %s | Reorder: %s | Qty: %s",
            product.product_id,
            inventory.current_stock,
            pending_qty,
            weightage.recommendation_score,
            recommendation["reorder_required"],
            recommendation["reorder_quantity"]
        )

        if recommendation["reorder_required"] and recommendation["reorder_quantity"] > 0:
            existing_order = OrderListRepository.get_active_order_for_product(
                db,
                product.product_id,
                retailer.retailer_id
            )

            if existing_order is None:
                justification = ReorderingEngineService._build_justification(
                    product=product,
                    inventory=inventory,
                    average_daily_sales=average_daily_sales,
                    reorder_quantity=recommendation["reorder_quantity"],
                    supplier=supplier,
                    score=weightage.recommendation_score,
                    reorder_required=recommendation["reorder_required"],
                    pending_order_qty=pending_qty
                )

                order_data = OrderListCreate(
                    product_id=product.product_id,
                    weightage_id=weightage.weightage_id,
                    retailer_id=retailer.retailer_id,
                    preferred_supplier_id=(
                        supplier.supplier_id
                        if supplier
                        else None
                    ),
                    recommended_order_qty=(
                        recommendation["reorder_quantity"]
                    ),
                    final_score=weightage.recommendation_score,
                    justification_summary=justification,
                    status="pending"
                )

                OrderListRepository.create(db, order_data)

        return ReorderRecommendation(
            product_id=product.product_id,
            product_name=product.product_name,
            recommendation_score=weightage.recommendation_score,
            reorder_required=recommendation["reorder_required"],
            reorder_quantity=recommendation["reorder_quantity"],
            supplier_id=(
                supplier.supplier_id
                if supplier
                else None
            ),
            supplier_name=(
                supplier.supplier_name
                if supplier
                else "N/A"
            ),
            estimated_lead_time=(
                int(supplier.lead_time_days)
                if supplier and getattr(supplier, "lead_time_days", None)
                else 0
            ),
            generated_at=weightage.generated_at
        )

    @staticmethod
    def generate_recommendations(
        db: Session,
        retailer_id: int,
        config_id: int
    ):
        """
        Generates reorder recommendations for all products belonging to a retailer.
        """
        logger.info(
            "Starting AI reordering engine for retailer_id=%s",
            retailer_id
        )

        retailer = RetailerRepository.get_by_id(db, retailer_id)

        if retailer is None:
            raise RetailerNotFoundException(retailer_id)

        weightages = WeightageRepository.get_by_retailer_and_config(
            db,
            retailer_id,
            config_id
        )

        logger.info(
            "Loaded %d generated weightages.",
            len(weightages)
        )

        recommendations = []
        for weightage in weightages:
            product = ProductRepository.get_by_id(
                db,
                weightage.product_id
            )

            if product is None:
                logger.warning(
                    "Product %s not found. Skipping.",
                    weightage.product_id
                )
                continue

            try:
                recommendation = (
                    ReorderingEngineService
                    ._generate_recommendation_for_product(
                        db=db,
                        retailer=retailer,
                        config_id=config_id,
                        product=product
                    )
                )
                recommendations.append(recommendation)
            except ValueError as exc:
                logger.warning(
                    "Skipping product %s: %s",
                    product.product_id,
                    exc
                )

        logger.info(
            "Generated %d recommendations.",
            len(recommendations)
        )

        return ReorderingResponse(
            retailer_id=retailer_id,
            total_products=len(weightages),
            recommended_orders=sum(
                1
                for recommendation in recommendations
                if recommendation.reorder_required
            ),
            recommendations=recommendations
        )

    @staticmethod
    def generate_single_recommendation(
        db: Session,
        retailer_id: int,
        config_id: int,
        product_id: int
    ):
        """
        Generate reorder recommendation for a single product.
        """
        retailer = RetailerRepository.get_by_id(db, retailer_id)

        if retailer is None:
            raise RetailerNotFoundException(retailer_id)

        product = ProductRepository.get_by_id(db, product_id)

        if product is None:
            raise ValueError(f"Product {product_id} not found.")

        return ReorderingEngineService._generate_recommendation_for_product(
            db=db,
            retailer=retailer,
            config_id=config_id,
            product=product
        )

    @staticmethod
    def generate_batch_recommendations(
        db: Session,
        retailer_id: int,
        config_id: int,
        product_ids: list[int]
    ):
        """
        Generate reorder recommendations for a batch list of product IDs.
        """
        if not product_ids:
            raise ValueError("Product IDs are required.")

        retailer = RetailerRepository.get_by_id(db, retailer_id)

        if retailer is None:
            raise RetailerNotFoundException(retailer_id)

        products = ProductRepository.get_by_ids(db, product_ids)

        if not products:
            raise ValueError("No products found.")

        recommendations = []

        for product in products:
            try:
                recommendation = (
                    ReorderingEngineService
                    ._generate_recommendation_for_product(
                        db=db,
                        retailer=retailer,
                        config_id=config_id,
                        product=product
                    )
                )
                recommendations.append(recommendation)
            except ValueError as exc:
                logger.warning(
                    "Skipping product %s: %s",
                    product.product_id,
                    exc
                )

        return ReorderingResponse(
            retailer_id=retailer_id,
            total_products=len(products),
            recommended_orders=sum(
                1
                for recommendation in recommendations
                if recommendation.reorder_required
            ),
            recommendations=recommendations
        )
