from sqlalchemy.orm import Session

from app.weightage.models import Weightage
from app.weightage.schemas import (
    WeightageCreate,
    WeightageUpdate
)


class WeightageRepository:
    """
    Handles database operations for Weightage.
    """

    @staticmethod
    def create(
        db: Session,
        weightage: WeightageCreate
    ):
        print(weightage.model_dump())
        db_weightage = Weightage(
            **weightage.model_dump()
        )

        db.add(db_weightage)
        db.commit()
        db.refresh(db_weightage)

        return db_weightage

    @staticmethod
    def get_all(
        db: Session
    ):
        return db.query(Weightage).all()

    @staticmethod
    def get_by_id(
        db: Session,
        weightage_id: int
    ):
        return (
            db.query(Weightage)
            .filter(
                Weightage.weightage_id == weightage_id
            )
            .first()
        )

    @staticmethod
    def get_by_retailer_and_config(
        db: Session,
        retailer_id: int,
        config_id: int
    ):
        """
        Fetch all generated weightages for a retailer
        and weight configuration.
        """

        return (
            db.query(Weightage)
            .filter(
                Weightage.retailer_id == retailer_id,
                Weightage.config_id == config_id
            )
            .order_by(
                Weightage.recommendation_score.desc()
            )
            .all()
        )
    @staticmethod
    def update(
        db: Session,
        weightage: Weightage,
        weightage_data: WeightageUpdate
    ):
        update_data = (
            weightage_data.model_dump(
                exclude_unset=True
            )
        )

        for key, value in update_data.items():
            setattr(weightage, key, value)

        db.commit()
        db.refresh(weightage)

        return weightage

    @staticmethod
    def delete(
        db: Session,
        weightage: Weightage
    ):
        db.delete(weightage)
        db.commit()

        return {
            "message": "Weightage deleted successfully."
        }

    @staticmethod
    def get_latest_by_product_id(
        db: Session,
        product_id: int
    ):
        """
        Returns the latest generated weightage
        for a product.
        """

        return (
            db.query(Weightage)
            .filter(
                Weightage.product_id == product_id
            )
            .order_by(
                Weightage.generated_at.desc()
            )
            .first()
        )
    @staticmethod
    def get_history_by_product_id(
        db: Session,
        product_id: int
    ):
        """
        Returns all historical weightages
        for a product.
        """

        return (
            db.query(Weightage)
            .filter(
                Weightage.product_id == product_id
            )
            .order_by(
                Weightage.generated_at.desc()
            )
            .all()
        )

    @staticmethod
    def get_by_product_and_config(
        db: Session,
        product_id: int,
        config_id: int
    ):
        """
        Fetch the latest weightage for a product under a configuration.
        """
        return (
            db.query(Weightage)
            .filter(
                Weightage.product_id == product_id,
                Weightage.config_id == config_id
            )
            .order_by(
                Weightage.generated_at.desc()
            )
            .first()
        )