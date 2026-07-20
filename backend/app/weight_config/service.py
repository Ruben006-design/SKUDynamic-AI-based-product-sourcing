import logging

from sqlalchemy.orm import Session

from app.exceptions.custom_exceptions import WeightConfigNotFoundException
from app.weight_config.repository import WeightConfigRepository
from app.weight_config.schemas import (
    WeightConfigCreate,
    WeightConfigUpdate
)

logger = logging.getLogger(__name__)


class WeightConfigService:
    """
    Contains business logic for Weight Configuration.
    """
            
    @staticmethod
    def validate_weights(config):
        total = (
            config.sales_volume_w +
            config.lead_time_w +
            config.supplier_quality_w +
            config.popularity_w +
            config.weather_w +
            config.festival_demand_w +
            config.durability_w +
            config.expiry_w
        )

        if round(total, 2) != 1.00:
            raise ValueError(
                f"Total weight must be 1.00. Current total = {total:.2f}"
            )
            
    @staticmethod
    def create_config(
        db: Session,
        config: WeightConfigCreate
    ):
        logger.info("Creating weight configuration")

        WeightConfigService.validate_weights(config)

        return WeightConfigRepository.create(
            db,
            config
        )
    @staticmethod
    def get_all_configs(
        db: Session
    ):
        return WeightConfigRepository.get_all(db)

    @staticmethod
    def get_config_by_id(
        db: Session,
        config_id: int
    ):
        config = WeightConfigRepository.get_by_id(
            db,
            config_id
        )

        if config is None:
            logger.warning(
                f"Weight configuration {config_id} not found."
            )
            raise WeightConfigNotFoundException(config_id)

        return config

    @staticmethod
    def update_config(
        db: Session,
        config_id: int,
        config_data: WeightConfigUpdate
    ):
        logger.info(
            f"Updating weight configuration {config_id}"
        )

        config = WeightConfigRepository.get_by_id(
            db,
            config_id
        )

        if config is None:
            logger.warning(
                f"Weight configuration {config_id} not found."
            )
            raise WeightConfigNotFoundException(config_id)

        return WeightConfigRepository.update(
            db,
            config,
            config_data
        )

    @staticmethod
    def delete_config(
        db: Session,
        config_id: int
    ):
        logger.info(
            f"Deleting weight configuration {config_id}"
        )

        config = WeightConfigRepository.get_by_id(
            db,
            config_id
        )

        if config is None:
            logger.warning(
                f"Weight configuration {config_id} not found."
            )
            raise WeightConfigNotFoundException(config_id)

        return WeightConfigRepository.delete(
            db,
            config
        )

    @staticmethod
    def update_retailer_weight_profile(
        db: Session,
        retailer_id: int,
        request
    ):
        profile = (
            WeightConfigRepository.update(
                db,
                retailer_id,
                request
            )
        )

        if profile is None:
            raise WeightConfigNotFoundException(
                retailer_id
            )

        return profile
