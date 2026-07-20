import logging
from statistics import mean

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
    Handles AI-based product reordering workflow.
    """
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

        weightage = (
            WeightageRepository.get_by_product_and_config(
                db,
                product.product_id,
                config_id
            )
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

        sales_history = SalesRepository.get_sales_history(
            db,
            product_id=product.product_id
        )

        average_daily_sales = 0

        if sales_history:
            average_daily_sales = mean(
                sale.quantity_sold
                for sale in sales_history
            )

        suppliers = (
            ProductSupplierRepository.get_by_product_id(
                db,
                product.product_id
            )
        )

        recommendation = (
            RecommendationEngine.generate_recommendation(
                product=product,
                inventory=inventory,
                weightage=weightage,
                suppliers=suppliers,
                average_daily_sales=average_daily_sales
            )
        )

        supplier = recommendation["supplier"]

        print(
            "DEBUG PRODUCT:",
            product.product_id,
            "Stock:",
            inventory.current_stock,
            "Reorder Point:",
            inventory.reorder_point,
            "Score:",
            weightage.recommendation_score,
            "Reorder:",
            recommendation["reorder_required"]
        )
        if recommendation["reorder_required"]:
            print(
                "DEBUG: Entered OrderList creation for",
                product.product_id
            )

            existing_order = (
                OrderListRepository.get_by_weightage_id(
                    db,
                    weightage.weightage_id
                )
            )

            if existing_order is None:

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
                    justification_summary=(
                        "Generated automatically by AI Reordering Engine."
                    ),
                    status="pending"
                )

                OrderListRepository.create(
                    db,
                    order_data
                )

        return ReorderRecommendation(
            product_id=product.product_id,
            product_name=product.product_name,
            recommendation_score=weightage.recommendation_score,
            reorder_required=recommendation["reorder_required"],
            reorder_quantity=recommendation["reorder_quantity"],
            supplier_id=(
                supplier.supplier_id
                if supplier
                else 0
            ),
            supplier_name=(
                supplier.supplier_name
                if supplier
                else "N/A"
            ),
            estimated_lead_time=(
                int(supplier.lead_time_days)
                if supplier and supplier.lead_time_days
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
        Generates reorder recommendations for a retailer.
        """

        logger.info(
            "Starting AI reordering engine for retailer_id=%s",
            retailer_id
        )

        retailer = RetailerRepository.get_by_id(
            db,
            retailer_id
        )

        if retailer is None:
            raise RetailerNotFoundException(
                retailer_id
            )

        weightages = (
            WeightageRepository.get_by_retailer_and_config(
                db,
                retailer_id,
                config_id
            )
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

            recommendation = (
                ReorderingEngineService
                ._generate_recommendation_for_product(
                    db=db,
                    retailer=retailer,
                    config_id=config_id,
                    product=product
                )
            )

            recommendations.append(
                recommendation
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

        retailer = RetailerRepository.get_by_id(
            db,
            retailer_id
        )

        if retailer is None:
            raise RetailerNotFoundException(
                retailer_id
            )

        product = ProductRepository.get_by_id(
            db,
            product_id
        )

        if product is None:
            raise ValueError(
                f"Product {product_id} not found."
            )

        recommendation = (
            ReorderingEngineService
            ._generate_recommendation_for_product(
                db=db,
                retailer=retailer,
                config_id=config_id,
                product=product
            )
        )

        return recommendation

    @staticmethod
    def generate_batch_recommendations(
        db: Session,
        retailer_id: int,
        config_id: int,
        product_ids: list[int]
    ):
        """
        Generate reorder recommendations for a list of products.
        """

        if not product_ids:
            raise ValueError(
                "Product IDs are required."
            )

        retailer = RetailerRepository.get_by_id(
            db,
            retailer_id
        )

        if retailer is None:
            raise RetailerNotFoundException(
                retailer_id
            )

        products = ProductRepository.get_by_ids(
            db,
            product_ids
        )

        if not products:
            raise ValueError(
                "No products found."
            )

        recommendations = []

        for product in products:

            recommendation = (
                ReorderingEngineService
                ._generate_recommendation_for_product(
                    db=db,
                    retailer=retailer,
                    config_id=config_id,
                    product=product
                )
            )

            recommendations.append(
                recommendation
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