from sqlalchemy.orm import Session
from datetime import date
from app.sales.models import Sales
from app.sales.schemas import SalesCreate, SalesUpdate


class SalesRepository:
    """
    Handles database operations for Sales.
    """

    @staticmethod
    def create(
        db: Session,
        sales: SalesCreate
    ):
        db_sales = Sales(**sales.model_dump())

        db.add(db_sales)
        db.commit()
        db.refresh(db_sales)

        return db_sales

    @staticmethod
    def get_all(db: Session):
        return db.query(Sales).all()

    @staticmethod
    def get_by_id(
        db: Session,
        sale_id: int
    ):
        return (
            db.query(Sales)
            .filter(Sales.sale_id == sale_id)
            .first()
        )

    @staticmethod
    def update(
        db: Session,
        db_sales: Sales,
        sales_data: SalesUpdate
    ):
        update_data = sales_data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(db_sales, key, value)

        db.commit()
        db.refresh(db_sales)

        return db_sales

    @staticmethod
    def delete(
        db: Session,
        db_sales: Sales
    ):
        db.delete(db_sales)
        db.commit()
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

        query = db.query(Sales)

        if product_id is not None:
            query = query.filter(
                Sales.product_id == product_id
            )

        if from_date is not None:
            query = query.filter(
                Sales.sale_date >= from_date
            )

        if to_date is not None:
            query = query.filter(
                Sales.sale_date <= to_date
            )

        return query.all()