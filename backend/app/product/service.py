from sqlalchemy.orm import Session
from app.exceptions.custom_exceptions import ProductNotFoundException
from app.product.repository import ProductRepository
from app.product.schemas import (
    ProductCreate,
    ProductUpdate
)
import logging

logger = logging.getLogger(__name__)

class ProductService:
    """
    Contains business logic for Product.
    """

    @staticmethod
    def create_product(
        db: Session,
        product: ProductCreate
    ):
        logger.info("Creating a new product")

        created_product = ProductRepository.create(db, product)

        logger.info(
            f"Product created successfully with ID {created_product.product_id}"
        )

        return created_product

    @staticmethod
    def get_all_products(db: Session):
        logger.info("Fetching all products")

        return ProductRepository.get_all(db)

    @staticmethod
    def get_product_by_id(
        db: Session,
        product_id: int
    ):
        logger.info(f"Fetching product with ID {product_id}")

        product = ProductRepository.get_by_id(db, product_id)

        if product is None:
            logger.error(f"Product with ID {product_id} not found")
            raise ProductNotFoundException(product_id)

        return product

    @staticmethod
    def update_product(
        db: Session,
        product_id: int,
        product_data: ProductUpdate
    ):
        logger.info(f"Updating product with ID {product_id}")

        product = ProductRepository.get_by_id(db, product_id)

        if product is None:
            logger.error(f"Product with ID {product_id} not found")
            raise ProductNotFoundException(product_id)

        updated_product = ProductRepository.update(
            db,
            product,
            product_data
        )

        logger.info(f"Product {product_id} updated successfully")

        return updated_product

    @staticmethod
    def delete_product(
        db: Session,
        product_id: int
    ):
        logger.info(f"Deleting product with ID {product_id}")

        product = ProductRepository.get_by_id(db, product_id)

        if product is None:
            logger.error(f"Product with ID {product_id} not found")
            raise ProductNotFoundException(product_id)

        ProductRepository.delete(db, product)

        logger.info(f"Product {product_id} deleted successfully")

        return {
            "message": "Product deleted successfully."
        }