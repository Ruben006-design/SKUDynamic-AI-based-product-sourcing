from sqlalchemy.orm import Session

from app.supplier.models import Supplier
from app.supplier.schemas import (
    SupplierCreate,
    SupplierUpdate,
)


class SupplierRepository:
    """
    Handles all Supplier database operations.
    """

    @staticmethod
    def create(
        db: Session,
        supplier: SupplierCreate
    ):
        db_supplier = Supplier(
            **supplier.model_dump()
        )

        db.add(db_supplier)
        db.commit()
        db.refresh(db_supplier)

        return db_supplier

    @staticmethod
    def get_all(db: Session):
        return db.query(Supplier).all()

    @staticmethod
    def get_by_id(
        db: Session,
        supplier_id: int
    ):
        return (
            db.query(Supplier)
            .filter(
                Supplier.supplier_id == supplier_id
            )
            .first()
        )

    @staticmethod
    def update(
        db: Session,
        db_supplier: Supplier,
        supplier_data: SupplierUpdate
    ):
        update_data = supplier_data.model_dump(
            exclude_unset=True
        )

        for key, value in update_data.items():
            setattr(
                db_supplier,
                key,
                value
            )

        db.commit()
        db.refresh(db_supplier)

        return db_supplier

    @staticmethod
    def delete(
        db: Session,
        db_supplier: Supplier
    ):
        db.delete(db_supplier)
        db.commit()