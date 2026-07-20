from sqlalchemy.orm import Session

from app.product_supplier.models import ProductSupplier
from app.product_supplier.schemas import (
    ProductSupplierCreate,
    ProductSupplierUpdate,
)


class ProductSupplierRepository:
    """
    Handles all ProductSupplier
    database operations.
    """

    @staticmethod
    def create(
        db: Session,
        product_supplier: ProductSupplierCreate,
    ):
        db_product_supplier = ProductSupplier(
            **product_supplier.model_dump()
        )

        db.add(db_product_supplier)
        db.commit()
        db.refresh(db_product_supplier)

        return db_product_supplier

    @staticmethod
    def get_all(db: Session):
        return db.query(
            ProductSupplier
        ).all()

    @staticmethod
    def get_by_id(
        db: Session,
        product_supplier_id: int,
    ):
        return (
            db.query(ProductSupplier)
            .filter(
                ProductSupplier.product_supplier_id
                == product_supplier_id
            )
            .first()
        )

    @staticmethod
    def update(
        db: Session,
        db_product_supplier: ProductSupplier,
        product_supplier_data:
            ProductSupplierUpdate,
    ):
        update_data = (
            product_supplier_data
            .model_dump(exclude_unset=True)
        )

        for key, value in update_data.items():
            setattr(
                db_product_supplier,
                key,
                value,
            )

        db.commit()
        db.refresh(
            db_product_supplier
        )

        return db_product_supplier

    @staticmethod
    def delete(
        db: Session,
        db_product_supplier:
            ProductSupplier,
    ):
        db.delete(
            db_product_supplier
        )
        db.commit()

    @staticmethod
    def get_by_product_id(
        db: Session,
        product_id: int
    ):
        """
        Fetch all suppliers linked to a product.
        """

        return (
            db.query(ProductSupplier)
            .filter(
                ProductSupplier.product_id == product_id
            )
            .all()
        )