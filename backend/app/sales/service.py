import logging

from sqlalchemy.orm import Session
from datetime import date
from app.exceptions.custom_exceptions import SalesNotFoundException
from app.sales.repository import SalesRepository
from app.sales.schemas import (
    SalesCreate,
    SalesUpdate
)

logger = logging.getLogger(__name__)


class SalesService:
    """
    Contains business logic for Sales.
    """

    @staticmethod
    def create_sale(
        db: Session,
        sale: SalesCreate
    ):
        logger.info("Creating a new sale record")
        return SalesRepository.create(db, sale)

    @staticmethod
    def get_all_sales(
        db: Session
    ):
        logger.info("Fetching all sales records")
        return SalesRepository.get_all(db)

    @staticmethod
    def get_sale_by_id(
        db: Session,
        sale_id: int
    ):
        logger.info(f"Fetching sale with ID: {sale_id}")

        sale = SalesRepository.get_by_id(db, sale_id)

        if sale is None:
            logger.warning(f"Sale with ID {sale_id} not found")
            raise SalesNotFoundException(sale_id)

        return sale

    @staticmethod
    def update_sale(
        db: Session,
        sale_id: int,
        sale_data: SalesUpdate
    ):
        logger.info(f"Updating sale with ID: {sale_id}")

        sale = SalesRepository.get_by_id(db, sale_id)

        if sale is None:
            logger.warning(f"Sale with ID {sale_id} not found")
            raise SalesNotFoundException(sale_id)

        updated_sale = SalesRepository.update(
            db,
            sale,
            sale_data
        )

        logger.info(f"Sale with ID {sale_id} updated successfully")

        return updated_sale

    @staticmethod
    def delete_sale(
        db: Session,
        sale_id: int
    ):
        logger.info(f"Deleting sale with ID: {sale_id}")

        sale = SalesRepository.get_by_id(db, sale_id)

        if sale is None:
            logger.warning(f"Sale with ID {sale_id} not found")
            raise SalesNotFoundException(sale_id)

        SalesRepository.delete(db, sale)

        logger.info(f"Sale with ID {sale_id} deleted successfully")

        return {
            "message": "Sale deleted successfully."
        }
    @staticmethod
    def get_sales_history(
        db: Session,
        product_id: int | None = None,
        from_date: date | None = None,
        to_date: date | None = None
    ):
        """
        Fetch sales history using optional filters.
        """

        logger.info(
            "Fetching filtered sales history."
        )

        return SalesRepository.get_sales_history(
            db,
            product_id,
            from_date,
            to_date
        )