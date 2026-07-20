import logging
from sqlalchemy.orm import Session
from app.exceptions.custom_exceptions import RetailerNotFoundException
from app.retailer.repository import RetailerRepository
from app.retailer.schemas import (
    RetailerCreate,
    RetailerUpdate,
    RetailerResponse
)

logger = logging.getLogger(__name__)

class RetailerService:
    """
    Contains business logic for Retailer.
    """

    @staticmethod
    def create_retailer(db: Session, retailer: RetailerCreate):
        logger.info("Creating a new retailer")
        return RetailerRepository.create(db, retailer)

    @staticmethod
    def get_all_retailers(db: Session):
        logger.info("Fetching all retailers")
        return RetailerRepository.get_all(db)

    @staticmethod
    def get_retailer_by_id(db: Session, retailer_id: int):
        logger.info(f"Fetching retailer with ID: {retailer_id}")

        retailer = RetailerRepository.get_by_id(db, retailer_id)

        if retailer is None:
            logger.warning(f"Retailer with ID {retailer_id} not found")
            raise RetailerNotFoundException(retailer_id)

        logger.info(f"Retailer with ID {retailer_id} retrieved successfully")
        return retailer

    @staticmethod
    def update_retailer(
        db: Session,
        retailer_id: int,
        retailer_data: RetailerUpdate
    ):
        logger.info(f"Updating retailer with ID: {retailer_id}")

        retailer = RetailerRepository.get_by_id(db, retailer_id)

        if retailer is None:
            logger.warning(f"Retailer with ID {retailer_id} not found")
            raise RetailerNotFoundException(retailer_id)

        updated_retailer = RetailerRepository.update(
            db,
            retailer,
            retailer_data
        )

        logger.info(f"Retailer with ID {retailer_id} updated successfully")
        return updated_retailer