from sqlalchemy.orm import Session

from app.weight_config.models import WeightConfig
from app.weight_config.schemas import (
    WeightConfigCreate,
    WeightConfigUpdate
)


class WeightConfigRepository:
    """
    Handles all database operations for WeightConfig.
    """

    @staticmethod
    def create(
        db: Session,
        config: WeightConfigCreate
    ):
        new_config = WeightConfig(
            **config.model_dump()
        )

        db.add(new_config)
        db.commit()
        db.refresh(new_config)

        return new_config

    @staticmethod
    def get_all(db: Session):
        return db.query(WeightConfig).all()

    @staticmethod
    def get_by_id(
        db: Session,
        config_id: int
    ):
        return (
            db.query(WeightConfig)
            .filter(
                WeightConfig.config_id == config_id
            )
            .first()
        )

    @staticmethod
    def update(
        db: Session,
        config: WeightConfig,
        config_data: WeightConfigUpdate
    ):
        update_data = config_data.model_dump(
            exclude_unset=True
        )

        for key, value in update_data.items():
            setattr(config, key, value)

        db.commit()
        db.refresh(config)

        return config

    @staticmethod
    def delete(
        db: Session,
        config: WeightConfig
    ):
        db.delete(config)
        db.commit()

        return {
            "message": "Weight configuration deleted successfully."
        }

    @staticmethod
    def get_by_retailer_id(
        db: Session,
        retailer_id: int
    ):
        return (
            db.query(WeightConfig)
            .filter(
                WeightConfig.retailer_id == retailer_id,
                WeightConfig.is_active == True
            )
            .first()
        )

    @staticmethod
    def update(
        db: Session,
        retailer_id: int,
        request
    ):
        config = (
            db.query(WeightConfig)
            .filter(
                WeightConfig.retailer_id == retailer_id,
                WeightConfig.is_active == True
            )
            .first()
        )

        if config is None:
            return None

        config.sales_volume_w = request.sales_volume_w
        config.lead_time_w = request.lead_time_w
        config.supplier_quality_w = request.supplier_quality_w
        config.popularity_w = request.popularity_w
        config.weather_w = request.weather_w
        config.festival_demand_w = request.festival_demand_w
        config.durability_w = request.durability_w
        config.expiry_w = request.expiry_w

        db.commit()
        db.refresh(config)

        return config