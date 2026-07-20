import logging
from sqlalchemy.orm import Session
from app.product.repository import ProductRepository
from app.retailer.repository import RetailerRepository
from app.inventory.repository import InventoryRepository
from app.sales.repository import SalesRepository
from app.supplier.repository import SupplierRepository
from app.human_evaluation.repository import (
    HumanEvaluationRepository
)
from app.weight_config.repository import (
    WeightConfigRepository
)
from app.weightage.repository import (
    WeightageRepository
)
from app.product_supplier.repository import (
    ProductSupplierRepository
)
from app.weightage_engine.recommendation_calculator import (
    RecommendationCalculator
)
from app.weightage.schemas import (
    WeightageCreate,WeightageUpdate
)
from app.exceptions.custom_exceptions import (
    RetailerNotFoundException
)
from app.exceptions.custom_exceptions import (
    WeightConfigNotFoundException
)
from app.weightage_engine.prompt_builder import (
    PromptBuilder
)
from app.weightage_engine.llm_client import (
    LLMClient
)
from app.weightage_engine.validator import (
    WeightValidator
)
from app.weightage_engine.schemas import (
    WeightageGenerationResponse
)
from app.weightage_engine.schemas import (
    LLMPromptRequest
)

logger = logging.getLogger(__name__)


class WeightageEngineService:
    """
    Handles AI weight generation workflow.
    """

    @staticmethod
    def generate_weightage(
        db: Session,
        request
    ):
        logger.info(
            "Starting AI weight generation."
        )

        retailer = RetailerRepository.get_by_id(
            db,
            request.retailer_id
        )

        if retailer is None:
            raise RetailerNotFoundException(
                request.retailer_id
        )

        config = WeightConfigRepository.get_by_id(
            db,
            request.config_id
        )

        if config is None:
            raise WeightConfigNotFoundException(
                request.config_id
            )

        products = ProductRepository.get_all(db)

        if not products:
            logger.warning(
                "No products found in the database."
            )
            raise ValueError(
                "No products available for weight generation."
            )

        inventory = InventoryRepository.get_all(db)

        if not inventory:
            logger.warning(
                "No inventory records found."
            )
            raise ValueError(
                "No inventory available for weight generation."
            )

        sales = SalesRepository.get_all(db)

        if not sales:
            logger.warning(
                "No sales records found."
            )
            raise ValueError(
                "No sales available for weight generation."
            )

        suppliers = SupplierRepository.get_all(db)

        if not suppliers:
            logger.warning(
                "No suppliers found."
            )
            raise ValueError(
                "No suppliers available for weight generation."
            )

        human_evaluations = (
            HumanEvaluationRepository.get_all(db)
        )

        if not human_evaluations:
            logger.warning(
                "No human evaluation records found."
            )
            human_evaluations = []

        generated_weightage_ids = []

        for product in products:

            db_weightage = (
                WeightageEngineService
                ._generate_weightage_for_product(
                    db=db,
                    retailer=retailer,
                    config=config,
                    product=product,
                    human_evaluations=human_evaluations
                )
            )

            generated_weightage_ids.append(
                db_weightage.weightage_id
            )

        logger.info(
            "AI weight generation successful."
        )

        return WeightageGenerationResponse(
            message="Weightages generated successfully.",
            total_products=len(products),
            generated_weightage_ids=generated_weightage_ids
        )
    @staticmethod
    def _generate_weightage_for_product(
        db: Session,
        retailer,
        config,
        product,
        human_evaluations
    ):
        """
        Generates and stores AI weightage for a single product.
        """

        product_inventory = (
            InventoryRepository.get_by_product_id(
                db,
                product.product_id
            )
        )

        product_sales = (
            SalesRepository.get_sales_history(
                db,
                product_id=product.product_id
            )
        )

        product_suppliers = (
            ProductSupplierRepository.get_by_product_id(
                db,
                product.product_id
            )
        )

        prompt = PromptBuilder.build_prompt(
            retailer,
            config,
            product,
            product_inventory,
            product_sales,
            product_suppliers,
            human_evaluations
        )
        logger.info("STEP 1: Calling Gemini")
        weights = LLMClient.generate_weights(prompt)

        logger.info("STEP 2: Gemini returned")
        WeightValidator.validate(weights)

        logger.info("STEP 3: Validation complete")

        recommendation_score = (
            RecommendationCalculator.calculate(
                product,
                product_inventory,
                product_sales,
                product_suppliers,
                weights
            )
        )

        logger.info("STEP 4: Recommendation calculated")


        logger.info(
            "Product %s recommendation score: %s",
            product.product_id,
            recommendation_score
        )

        weightage_data = WeightageCreate(
            product_id=product.product_id,
            retailer_id=retailer.retailer_id,
            config_id=config.config_id,

            sales_volume_weight=weights["sales_volume_weight"],
            lead_time_weight=weights["lead_time_weight"],
            supplier_quality_weight=weights["supplier_quality_weight"],
            popularity_weight=weights["popularity_weight"],
            weather_weight=weights["weather_weight"],
            festival_demand_weight=weights["festival_demand_weight"],
            durability_weight=weights["durability_weight"],
            expiry_weight=weights["expiry_weight"],

            recommendation_score=recommendation_score,
            llm_model_used=LLMClient.MODEL_NAME
        )
        logger.info("STEP 5: Checking existing weightage")

        existing_weightage = (
            WeightageRepository.get_by_product_and_config(
                db,
                product.product_id,
                config.config_id
            )
        )

        if existing_weightage:
            logger.info("STEP 6: Updating existing weightage")
            update_data = WeightageUpdate(
                **weightage_data.model_dump()
            )

            db_weightage = (
                WeightageRepository.update(
                    db,
                    existing_weightage,
                    update_data
                )
            )

            logger.info(
                "Updated existing weightage for product %s",
                product.product_id
            )

        else:
            logger.info("STEP 7: Creating new weightage")
            db_weightage = (
                WeightageRepository.create(
                    db,
                    weightage_data
                )
            )

            logger.info(
                "Created new weightage for product %s",
                product.product_id
            )

        logger.info(
            "Weightage data: %s",
            weightage_data.model_dump()
        )
        logger.info("STEP 8: Finished")
        return db_weightage

    @staticmethod
    def generate_single_weightage(
        db: Session,
        product_id: int,
        request
    ):
        retailer = RetailerRepository.get_by_id(
            db,
            request.retailer_id
        )

        if retailer is None:
            raise RetailerNotFoundException(
                request.retailer_id
            )

        config = WeightConfigRepository.get_by_id(
            db,
            request.config_id
        )

        if config is None:
            raise WeightConfigNotFoundException(
                request.config_id
            )

        product = ProductRepository.get_by_id(
            db,
            product_id
        )

        if product is None:
            raise ValueError(
                f"Product with ID {product_id} not found."
            )

        human_evaluations = (
            HumanEvaluationRepository.get_all(db)
        )

        if not human_evaluations:
            human_evaluations = []

        return WeightageEngineService._generate_weightage_for_product(
            db=db,
            retailer=retailer,
            config=config,
            product=product,
            human_evaluations=human_evaluations,
        )

    @staticmethod
    def generate_batch_weightage(
        db: Session,
        request
    ):
        """
        Generate AI weightages for a list of product IDs.
        """
        if not request.product_ids:
            raise ValueError(
                "Product IDs are required."
            )
        logger.info(
            "Starting batch AI weight generation."
        )

        retailer = RetailerRepository.get_by_id(
            db,
            request.retailer_id
        )

        if retailer is None:
            raise RetailerNotFoundException(
                request.retailer_id
            )

        config = WeightConfigRepository.get_by_id(
            db,
            request.config_id
        )

        if config is None:
            raise WeightConfigNotFoundException(
                request.config_id
            )

        human_evaluations = (
            HumanEvaluationRepository.get_all(db)
        )

        if not human_evaluations:
            human_evaluations = []

        products = ProductRepository.get_by_ids(
            db,
            request.product_ids
        )

        if not products:
            raise ValueError(
                "No products found for the given product IDs."
            )

        generated_weightage_ids = []

        for product in products:

            db_weightage = (
                WeightageEngineService._generate_weightage_for_product(
                    db=db,
                    retailer=retailer,
                    config=config,
                    product=product,
                    human_evaluations=human_evaluations
                )
            )

            generated_weightage_ids.append(
                db_weightage.weightage_id
            )

        return WeightageGenerationResponse(
            message="Batch weightages generated successfully.",
            total_products=len(products),
            generated_weightage_ids=generated_weightage_ids
        )

    @staticmethod
    def generate_llm_prompt(
        db: Session,
        request: LLMPromptRequest
    ):
        retailer = RetailerRepository.get_by_id(
            db,
            request.retailer_id
        )

        if retailer is None:
            raise RetailerNotFoundException(
                request.retailer_id
            )

        config = WeightConfigRepository.get_by_id(
            db,
            request.config_id
        )

        if config is None:
            raise WeightConfigNotFoundException(
                request.config_id
            )

        product = ProductRepository.get_by_id(
            db,
            request.product_id
        )

        if product is None:
            raise ValueError(
                "Product not found."
            )

        inventory = InventoryRepository.get_by_product_id(
            db,
            product.product_id
        )

        sales = SalesRepository.get_sales_history(
            db,
            product.product_id
        )

        suppliers = ProductSupplierRepository.get_by_product_id(
            db,
            product.product_id
        )

        human_evaluations = (
            HumanEvaluationRepository.get_all(db)
        )

        if not human_evaluations:
            human_evaluations = []

        prompt = PromptBuilder.build_prompt(
            retailer,
            config,
            product,
            inventory,
            sales,
            suppliers,
            human_evaluations
        )

        weights = LLMClient.generate_weights(
            prompt
        )

        WeightValidator.validate(
            weights
        )

        return weights