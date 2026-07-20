from sqlalchemy.orm import Session

from app.retailer.models import Retailer
from app.retailer.schemas import RetailerCreate

class RetailerRepository:
    """
    Handles all database operations related to Retailer.
    """

    @staticmethod
    def create(db: Session, retailer: RetailerCreate) -> Retailer:
        """
        Create a new retailer.
        """

        db_retailer = Retailer(
            retailer_name=retailer.retailer_name,
            industry_type=retailer.industry_type,
            contact_email=retailer.contact_email,
            plan_tier=retailer.plan_tier
        )

        db.add(db_retailer)
        db.commit()
        db.refresh(db_retailer)

        return db_retailer

    @staticmethod
    def get_all(db: Session):
        """
        Fetch all retailers.
        """
        return db.query(Retailer).all()

    @staticmethod
    def get_by_id(db: Session, retailer_id: int):
        """
        Fetch a retailer by its ID.
        """
        return (
            db.query(Retailer)
            .filter(Retailer.retailer_id == retailer_id)
            .first()
        )

    @staticmethod
    def update(
        db: Session,
        retailer,
        retailer_data
):
        update_data = retailer_data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(retailer, key, value)

        db.commit()
        db.refresh(retailer)
        return retailer


