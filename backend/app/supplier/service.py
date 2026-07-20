import logging
from sqlalchemy.orm import Session
from app.exceptions.custom_exceptions import (
    SupplierNotFoundException,
)
from app.supplier.repository import SupplierRepository
from app.supplier.schemas import (
    SupplierCreate,
    SupplierUpdate,
)
logger = logging.getLogger(__name__)
class SupplierService:
    """
    Contains business logic for Supplier.
    """

    @staticmethod
    def create_supplier(
        db: Session,
        supplier: SupplierCreate
    ):
        logger.info("Creating a new supplier")

        return SupplierRepository.create(
            db,
            supplier
        )

    @staticmethod
    def get_all_suppliers(
        db: Session
    ):
        logger.info(
            "Fetching all suppliers"
        )

        return SupplierRepository.get_all(db)

    @staticmethod
    def get_supplier_by_id(
        db: Session,
        supplier_id: int
    ):
        logger.info(
            f"Fetching supplier with ID: "
            f"{supplier_id}"
        )

        supplier = SupplierRepository.get_by_id(
            db,
            supplier_id
        )

        if supplier is None:
            logger.warning(
                f"Supplier with ID "
                f"{supplier_id} "
                f"not found"
            )

            raise SupplierNotFoundException(
                supplier_id
            )

        logger.info(
            f"Supplier with ID "
            f"{supplier_id} "
            f"retrieved successfully"
        )

        return supplier

    @staticmethod
    def update_supplier(
        db: Session,
        supplier_id: int,
        supplier_data: SupplierUpdate
    ):
        logger.info(
            f"Updating supplier "
            f"with ID: {supplier_id}"
        )

        supplier = SupplierRepository.get_by_id(
            db,
            supplier_id
        )

        if supplier is None:
            logger.warning(
                f"Supplier with ID "
                f"{supplier_id} "
                f"not found"
            )

            raise SupplierNotFoundException(
                supplier_id
            )

        updated_supplier = (
            SupplierRepository.update(
                db,
                supplier,
                supplier_data
            )
        )

        logger.info(
            f"Supplier with ID "
            f"{supplier_id} "
            f"updated successfully"
        )

        return updated_supplier

    @staticmethod
    def delete_supplier(
        db: Session,
        supplier_id: int
    ):
        logger.info(
            f"Deleting supplier "
            f"with ID: {supplier_id}"
        )

        supplier = SupplierRepository.get_by_id(
            db,
            supplier_id
        )

        if supplier is None:
            logger.warning(
                f"Supplier with ID "
                f"{supplier_id} "
                f"not found"
            )

            raise SupplierNotFoundException(
                supplier_id
            )

        SupplierRepository.delete(
            db,
            supplier
        )

        logger.info(
            f"Supplier with ID "
            f"{supplier_id} "
            f"deleted successfully"
        )

        return {
            "message":
            "Supplier deleted successfully"
        }