from sqlalchemy.orm import Session

from app.inventory.models import Inventory
from app.inventory.schemas import (
    InventoryCreate,
    InventoryUpdate
)


class InventoryRepository:
    """
    Handles all Inventory database operations.
    """

    @staticmethod
    def create(
        db: Session,
        inventory: InventoryCreate
    ):
        db_inventory = Inventory(
            **inventory.model_dump()
        )

        db.add(db_inventory)
        db.commit()
        db.refresh(db_inventory)

        return db_inventory

    @staticmethod
    def get_all(db: Session):
        return db.query(Inventory).all()

    @staticmethod
    def get_by_id(
        db: Session,
        inventory_id: int
    ):
        return (
            db.query(Inventory)
            .filter(
                Inventory.inventory_id == inventory_id
            )
            .first()
        )

    @staticmethod
    def update(
        db: Session,
        db_inventory: Inventory,
        inventory_data: InventoryUpdate
    ):
        update_data = inventory_data.model_dump(
            exclude_unset=True
        )

        for key, value in update_data.items():
            setattr(
                db_inventory,
                key,
                value
            )

        db.commit()
        db.refresh(db_inventory)

        return db_inventory

    @staticmethod
    def delete(
        db: Session,
        db_inventory: Inventory
    ):
        db.delete(db_inventory)
        db.commit()

    @staticmethod
    def get_by_product_id(
        db: Session,
        product_id: int
    ):
        """
        Fetch inventory by product ID.
        """
        return (
            db.query(Inventory)
            .filter(
                Inventory.product_id == product_id
            )
            .first()
        )