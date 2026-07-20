import logging

from sqlalchemy.orm import Session

from app.exceptions.custom_exceptions import (
    WeightageNotFoundException,
    InvalidWeightageException
)
from app.weightage.repository import WeightageRepository
from app.weightage.schemas import (
    WeightageCreate,
    WeightageUpdate
)
from app.weight_config.repository import (
    WeightConfigRepository
)
from app.weightage_engine.validator import WeightValidator
from app.weightage.schemas import WeightValidationResponse
logger = logging.getLogger(__name__)


class WeightageService:
    """
    Contains business logic for Weightage.
    """

    @staticmethod
    def validate_weights(weightage):
        """
        Ensures all weight values sum to 1.00.
        """

        total = (
            weightage.sales_volume_weight +
            weightage.lead_time_weight +
            weightage.supplier_quality_weight +
            weightage.popularity_weight +
            weightage.weather_weight +
            weightage.festival_demand_weight +
            weightage.durability_weight +
            weightage.expiry_weight
        )

        if round(total, 2) != 1.00:
            raise InvalidWeightageException(total)

    @staticmethod
    def create_weightage(
        db: Session,
        weightage: WeightageCreate
    ):
        logger.info("Creating weightage record.")

        WeightageService.validate_weights(weightage)

        return WeightageRepository.create(
            db,
            weightage
        )

    @staticmethod
    def get_all_weightages(
        db: Session
    ):
        return WeightageRepository.get_all(db)

    @staticmethod
    def get_weightage_by_id(
        db: Session,
        weightage_id: int
    ):
        weightage = WeightageRepository.get_by_id(
            db,
            weightage_id
        )

        if weightage is None:
            logger.warning(
                f"Weightage {weightage_id} not found."
            )
            raise WeightageNotFoundException(weightage_id)

        return weightage

    @staticmethod
    def update_weightage(
        db: Session,
        weightage_id: int,
        weightage_data: WeightageUpdate
    ):
        logger.info(
            f"Updating weightage {weightage_id}"
        )

        weightage = WeightageRepository.get_by_id(
            db,
            weightage_id
        )

        if weightage is None:
            logger.warning(
                f"Weightage {weightage_id} not found."
            )
            raise WeightageNotFoundException(weightage_id)

        WeightageService.validate_weights(weightage_data)

        return WeightageRepository.update(
            db,
            weightage,
            weightage_data
        )

    @staticmethod
    def delete_weightage(
        db: Session,
        weightage_id: int
    ):
        logger.info(
            f"Deleting weightage {weightage_id}"
        )

        weightage = WeightageRepository.get_by_id(
            db,
            weightage_id
        )

        if weightage is None:
            logger.warning(
                f"Weightage {weightage_id} not found."
            )
            raise WeightageNotFoundException(weightage_id)

        return WeightageRepository.delete(
            db,
            weightage
        )
    @staticmethod
    def get_latest_weightage(
        db: Session,
        product_id: int
    ):
        """
        Returns the latest weightage
        for a product.
        """

        weightage = (
            WeightageRepository.get_latest_by_product_id(
                db,
                product_id
            )
        )

        if weightage is None:
            raise ValueError(
                "Weightage not found."
            )

        return weightage

    @staticmethod
    def get_weightage_history(
        db: Session,
        product_id: int
    ):
        """
        Returns complete weightage history
        for a product.
        """

        history = (
            WeightageRepository.get_history_by_product_id(
                db,
                product_id
            )
        )

        if not history:
            raise ValueError(
                "No weightage history found."
            )

        return history

    @staticmethod
    def validate_weightage(
        db: Session,
        weightage_id: int
    ):
        """
        Validates whether the stored AI weights
        satisfy business rules.
        """

        weightage = WeightageRepository.get_by_id(
            db,
            weightage_id
        )

        if weightage is None:
            raise ValueError(
                "Weightage not found."
            )

        weights = {
            "sales_volume_weight": float(weightage.sales_volume_weight),
            "lead_time_weight": float(weightage.lead_time_weight),
            "supplier_quality_weight": float(weightage.supplier_quality_weight),
            "popularity_weight": float(weightage.popularity_weight),
            "weather_weight": float(weightage.weather_weight),
            "festival_demand_weight": float(weightage.festival_demand_weight),
            "durability_weight": float(weightage.durability_weight),
            "expiry_weight": float(weightage.expiry_weight),
        }

        WeightValidator.validate(weights)

        return WeightValidationResponse(
            weightage_id=weightage.weightage_id,
            valid=True,
            message="Weightage is valid."
        )
    @staticmethod
    def get_retailer_weight_profile(
        db: Session,
        retailer_id: int
    ):
        profile = (
            WeightConfigRepository.get_by_retailer_id(
                db,
                retailer_id
            )
        )

        if profile is None:
            raise WeightConfigNotFoundException(
                retailer_id
            )

        return profile