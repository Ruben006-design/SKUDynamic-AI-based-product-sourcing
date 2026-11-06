import logging
from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.product.repository import ProductRepository
from app.retailer.repository import RetailerRepository
from app.inventory.repository import InventoryRepository
from app.sales.repository import SalesRepository
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
    WeightageCreate, WeightageUpdate
)
from app.exceptions.custom_exceptions import (
    RetailerNotFoundException,
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
from app.weightage_engine.local_engine import (
    LocalWeightageEngine
)
from app.weightage_engine.schemas import (
    WeightageGenerationResponse,
    LLMPromptRequest
)
from app.core.config import settings

logger = logging.getLogger(__name__)


class WeightageEngineService:
    """
    Handles AI weight generation workflow.

    Provider selection is controlled by the LLM_PROVIDER environment variable:
      - 'local'  (default) : uses LocalWeightageEngine — no external API required
      - 'gemini'           : calls Gemini API with automatic fallback to local engine
    """

    @staticmethod
    def _resolve_weights(
        product,
        product_inventory,
        product_sales: list,
        product_suppliers: list,
        human_evaluations: list,
        config
    ) -> tuple:
        """
        Returns (weights_dict, llm_model_name) using the configured provider.
        Falls back to local engine if Gemini fails.
        """
        llm_provider = getattr(settings, "LLM_PROVIDER", "local").lower()

        if llm_provider == "gemini":
            try:
                prompt = PromptBuilder.build_prompt(
                    None,  # retailer not needed for prompt, config carries it
                    config,
                    product,
                    product_inventory,
                    product_sales,
                    product_suppliers,
                    human_evaluations
                )
                weights = LLMClient.generate_weights(prompt)
                WeightValidator.validate(weights)
                return weights, LLMClient.MODEL_NAME
            except Exception as exc:
                logger.warning(
                    "Gemini failed for product %s (%s). "
                    "Falling back to local engine.",
                    product.product_id, exc
                )

        # Local engine (default or fallback)
        weights = LocalWeightageEngine.generate_weights(
            product=product,
            inventory=product_inventory,
            sales=product_sales,
            product_suppliers=product_suppliers,
            human_evaluations=human_evaluations
        )
        WeightValidator.validate(weights)
        return weights, "local-statistical-engine-v1"

    @staticmethod
    def generate_weightage(
        db: Session,
        request
    ):
        logger.info("Starting AI weight generation.")

        retailer = RetailerRepository.get_by_id(db, request.retailer_id)

        if retailer is None:
            raise RetailerNotFoundException(request.retailer_id)

        config = WeightConfigRepository.get_by_id(db, request.config_id)

        if config is None:
            raise WeightConfigNotFoundException(request.config_id)

        # Filter products by retailer_id — do NOT fetch all products globally
        products = ProductRepository.get_by_retailer_id(db, request.retailer_id)

        if not products:
            logger.warning("No products found for retailer %s.", request.retailer_id)
            raise ValueError("No products available for weight generation.")

        human_evaluations = HumanEvaluationRepository.get_all(db)
        if not human_evaluations:
            human_evaluations = []

        generated_weightage_ids = []

        for product in products:
            try:
                db_weightage = WeightageEngineService._generate_weightage_for_product(
                    db=db,
                    retailer=retailer,
                    config=config,
                    product=product,
                    human_evaluations=human_evaluations
                )
                generated_weightage_ids.append(db_weightage.weightage_id)
            except Exception as exc:
                logger.error(
                    "Failed to generate weightage for product %s: %s",
                    product.product_id, exc
                )

        logger.info("AI weight generation complete.")

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
        human_evaluations: list
    ):
        """
        Generates and stores AI weightage for a single product.
        """

        product_inventory = InventoryRepository.get_by_product_id(
            db, product.product_id
        )

        today = date.today()
        # 90 calendar days inclusive: [today - 89, today]
        from_date = today - timedelta(days=89)
        product_sales = SalesRepository.get_sales_history(
            db,
            product_id=product.product_id,
            from_date=from_date,
            to_date=today
        )

        product_suppliers = ProductSupplierRepository.get_by_product_id(
            db, product.product_id
        )

        weights, llm_model = WeightageEngineService._resolve_weights(
            product=product,
            product_inventory=product_inventory,
            product_sales=product_sales,
            product_suppliers=product_suppliers,
            human_evaluations=human_evaluations,
            config=config
        )

        logger.info("Weights for product %s: %s", product.product_id, weights)

        recommendation_score = RecommendationCalculator.calculate(
            product,
            product_inventory,
            product_sales,
            product_suppliers,
            weights
        )

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
            llm_model_used=llm_model
        )

        existing_weightage = WeightageRepository.get_by_product_and_config(
            db,
            product.product_id,
            config.config_id
        )

        if existing_weightage:
            update_data = WeightageUpdate(**weightage_data.model_dump())
            db_weightage = WeightageRepository.update(
                db, existing_weightage, update_data
            )
            logger.info("Updated weightage for product %s.", product.product_id)
        else:
            db_weightage = WeightageRepository.create(db, weightage_data)
            logger.info("Created weightage for product %s.", product.product_id)

        return db_weightage

    @staticmethod
    def generate_single_weightage(
        db: Session,
        product_id: int,
        request
    ):
        retailer = RetailerRepository.get_by_id(db, request.retailer_id)

        if retailer is None:
            raise RetailerNotFoundException(request.retailer_id)

        config = WeightConfigRepository.get_by_id(db, request.config_id)

        if config is None:
            raise WeightConfigNotFoundException(request.config_id)

        product = ProductRepository.get_by_id(db, product_id)

        if product is None:
            raise ValueError(f"Product with ID {product_id} not found.")

        human_evaluations = HumanEvaluationRepository.get_all(db)
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
            raise ValueError("Product IDs are required.")

        logger.info("Starting batch AI weight generation.")

        retailer = RetailerRepository.get_by_id(db, request.retailer_id)

        if retailer is None:
            raise RetailerNotFoundException(request.retailer_id)

        config = WeightConfigRepository.get_by_id(db, request.config_id)

        if config is None:
            raise WeightConfigNotFoundException(request.config_id)

        human_evaluations = HumanEvaluationRepository.get_all(db)
        if not human_evaluations:
            human_evaluations = []

        products = ProductRepository.get_by_ids(db, request.product_ids)

        if not products:
            raise ValueError("No products found for the given product IDs.")

        generated_weightage_ids = []

        for product in products:
            try:
                db_weightage = WeightageEngineService._generate_weightage_for_product(
                    db=db,
                    retailer=retailer,
                    config=config,
                    product=product,
                    human_evaluations=human_evaluations
                )
                generated_weightage_ids.append(db_weightage.weightage_id)
            except Exception as exc:
                logger.error(
                    "Failed to generate weightage for product %s: %s",
                    product.product_id, exc
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
        """
        Returns the generated weights for a product.
        When LLM_PROVIDER is 'local', returns local engine weights with explanation.
        When LLM_PROVIDER is 'gemini', calls Gemini and returns its weights.
        """
        retailer = RetailerRepository.get_by_id(db, request.retailer_id)

        if retailer is None:
            raise RetailerNotFoundException(request.retailer_id)

        config = WeightConfigRepository.get_by_id(db, request.config_id)

        if config is None:
            raise WeightConfigNotFoundException(request.config_id)

        product = ProductRepository.get_by_id(db, request.product_id)

        if product is None:
            raise ValueError("Product not found.")

        inventory = InventoryRepository.get_by_product_id(db, product.product_id)
        today = date.today()
        # 90 calendar days inclusive: [today - 89, today]
        from_date = today - timedelta(days=89)
        sales = SalesRepository.get_sales_history(
            db,
            product_id=product.product_id,
            from_date=from_date,
            to_date=today
        )
        suppliers = ProductSupplierRepository.get_by_product_id(db, product.product_id)
        human_evaluations = HumanEvaluationRepository.get_all(db)
        if not human_evaluations:
            human_evaluations = []

        weights, llm_model = WeightageEngineService._resolve_weights(
            product=product,
            product_inventory=inventory,
            product_sales=sales,
            product_suppliers=suppliers,
            human_evaluations=human_evaluations,
            config=config
        )

        return {
            "weights": weights,
            "llm_model_used": llm_model,
            "explanation": LocalWeightageEngine.generate_explanation(weights, product)
        }
