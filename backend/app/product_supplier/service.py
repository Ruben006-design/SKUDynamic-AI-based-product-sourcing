import logging

from sqlalchemy.orm import Session

from app.product.repository import ProductRepository
from app.supplier.repository import SupplierRepository

from app.product_supplier.repository import (
    ProductSupplierRepository,
)

from app.product_supplier.schemas import (
    ProductSupplierCreate,
    ProductSupplierUpdate,
)

from app.product_supplier.models import (
    ProductSupplier,
)

from app.exceptions.custom_exceptions import (
    ProductNotFoundException,
    SupplierNotFoundException,
    ProductSupplierNotFoundException,
)

logger = logging.getLogger(__name__)


class ProductSupplierService:
    """
    Contains business logic for
    ProductSupplier.
    """

    @staticmethod
    def create_product_supplier(
        db: Session,
        product_supplier: ProductSupplierCreate,
    ):
        logger.info(
            "Creating product-supplier mapping"
        )

        product = ProductRepository.get_by_id(
            db,
            product_supplier.product_id,
        )

        if product is None:
            raise ProductNotFoundException(
                product_supplier.product_id
            )

        supplier = SupplierRepository.get_by_id(
            db,
            product_supplier.supplier_id,
        )

        if supplier is None:
            raise SupplierNotFoundException(
                product_supplier.supplier_id
            )

        return ProductSupplierRepository.create(
            db,
            product_supplier,
        )

    @staticmethod
    def get_all_product_suppliers(
        db: Session,
    ):
        return (
            ProductSupplierRepository
            .get_all(db)
        )

    @staticmethod
    def get_product_supplier_by_id(
        db: Session,
        product_supplier_id: int,
    ):
        product_supplier = (
            ProductSupplierRepository
            .get_by_id(
                db,
                product_supplier_id,
            )
        )

        if product_supplier is None:
            raise (
                ProductSupplierNotFoundException(
                    product_supplier_id
                )
            )

        return product_supplier

    @staticmethod
    def update_product_supplier(
        db: Session,
        product_supplier_id: int,
        product_supplier_data:
            ProductSupplierUpdate,
    ):
        db_product_supplier = (
            ProductSupplierRepository
            .get_by_id(
                db,
                product_supplier_id,
            )
        )

        if db_product_supplier is None:
            raise (
                ProductSupplierNotFoundException(
                    product_supplier_id
                )
            )

        return (
            ProductSupplierRepository
            .update(
                db,
                db_product_supplier,
                product_supplier_data,
            )
        )

    @staticmethod
    def delete_product_supplier(
        db: Session,
        product_supplier_id: int,
    ):
        db_product_supplier = (
            ProductSupplierRepository
            .get_by_id(
                db,
                product_supplier_id,
            )
        )

        if db_product_supplier is None:
            raise (
                ProductSupplierNotFoundException(
                    product_supplier_id
                )
            )

        ProductSupplierRepository.delete(
            db,
            db_product_supplier,
        )

        return {
            "message":
                "ProductSupplier deleted successfully"
        }