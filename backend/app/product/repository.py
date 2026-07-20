from sqlalchemy.orm import Session

from app.product.models import Product
from app.product.schemas import ProductCreate, ProductUpdate


class ProductRepository:
    """
    Handles all Product database operations.
    """

    @staticmethod
    def create(db: Session, product: ProductCreate):
        db_product = Product(**product.model_dump())

        db.add(db_product)
        db.commit()
        db.refresh(db_product)

        return db_product

    @staticmethod
    def get_all(db: Session):
        return db.query(Product).all()

    @staticmethod
    def get_by_id(db: Session, product_id: int):
        return (
            db.query(Product)
            .filter(Product.product_id == product_id)
            .first()
        )

    @staticmethod
    def update(
        db: Session,
        db_product: Product,
        product_data: ProductUpdate
    ):
        update_data = product_data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(db_product, key, value)

        db.commit()
        db.refresh(db_product)

        return db_product

    @staticmethod
    def delete(db: Session, db_product: Product):
        db.delete(db_product)
        db.commit()

    @staticmethod
    def get_by_ids(
        db: Session,
        product_ids: list[int]
    ):
        """
        Returns products matching the given IDs.
        """

        return (
            db.query(Product)
            .filter(
                Product.product_id.in_(product_ids)
            )
            .all()
        )