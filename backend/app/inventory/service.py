import logging
from sqlalchemy.orm import Session

from app.inventory.repository import InventoryRepository
from app.inventory.schemas import (
    InventoryCreate,
    InventoryUpdate
)
from app.exceptions.custom_exceptions import (
    InventoryNotFoundException
)

logger = logging.getLogger(__name__)


class InventoryService:
    """
    Contains business logic
    for Inventory.
    """

    @staticmethod
    def create_inventory(
        db: Session,
        inventory: InventoryCreate
    ):
        logger.info(
            "Creating a new inventory record"
        )

        return InventoryRepository.create(
            db,
            inventory
        )

    @staticmethod
    def get_all_inventories(
        db: Session
    ):
        logger.info(
            "Fetching all inventories"
        )

        return InventoryRepository.get_all(db)

    @staticmethod
    def get_inventory_by_id(
        db: Session,
        inventory_id: int
    ):
        logger.info(
            f"Fetching inventory "
            f"{inventory_id}"
        )

        inventory = (
            InventoryRepository.get_by_id(
                db,
                inventory_id
            )
        )

        if inventory is None:
            logger.warning(
                f"Inventory "
                f"{inventory_id} "
                f"not found"
            )

            raise InventoryNotFoundException(
                inventory_id
            )

        return inventory

    @staticmethod
    def update_inventory(
        db: Session,
        inventory_id: int,
        inventory_data: InventoryUpdate
    ):
        logger.info(
            f"Updating inventory "
            f"{inventory_id}"
        )

        inventory = (
            InventoryRepository.get_by_id(
                db,
                inventory_id
            )
        )

        if inventory is None:
            raise InventoryNotFoundException(
                inventory_id
            )

        return InventoryRepository.update(
            db,
            inventory,
            inventory_data
        )

    @staticmethod
    def delete_inventory(
        db: Session,
        inventory_id: int
    ):
        logger.info(
            f"Deleting inventory "
            f"{inventory_id}"
        )

        inventory = (
            InventoryRepository.get_by_id(
                db,
                inventory_id
            )
        )

        if inventory is None:
            raise InventoryNotFoundException(
                inventory_id
            )

        InventoryRepository.delete(
            db,
            inventory
        )

        return {
            "message":
                "Inventory deleted successfully"
        }
    @staticmethod
    def get_inventory_by_product_id(
        db: Session,
        product_id: int
    ):
        """
        Fetch inventory by product ID.
        """

        inventory = InventoryRepository.get_by_product_id(
            db,
            product_id
        )

        if inventory is None:
            logger.warning(
                f"No inventory found for product {product_id}."
            )
            raise InventoryNotFoundException(product_id)

        return inventory