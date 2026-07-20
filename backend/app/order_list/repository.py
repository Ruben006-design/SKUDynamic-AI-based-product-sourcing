from sqlalchemy.orm import Session

from app.order_list.models import OrderList
from app.order_list.schemas import (
    OrderListCreate,
    OrderListUpdate
)
from datetime import datetime

class OrderListRepository:
    """
    Handles all database operations for Order List.
    """

    @staticmethod
    def create(
        db: Session,
        order: OrderListCreate
    ):
        db_order = OrderList(
            **order.model_dump()
        )

        db.add(db_order)
        db.commit()
        db.refresh(db_order)

        return db_order

    @staticmethod
    def get_all(
        db: Session
    ):
        return db.query(OrderList).all()

    @staticmethod
    def get_by_id(
        db: Session,
        order_list_id: int
    ):
        return (
            db.query(OrderList)
            .filter(
                OrderList.order_list_id == order_list_id
            )
            .first()
        )
    @staticmethod
    def get_by_weightage_id(
        db: Session,
        weightage_id: int
    ):
        """
        Fetch an order recommendation by weightage.
        """

        return (
            db.query(OrderList)
            .filter(
                OrderList.weightage_id == weightage_id
            )
            .first()
        )   
    @staticmethod
    def update(
        db: Session,
        db_order: OrderList,
        order_data: OrderListUpdate
    ):
        update_data = order_data.model_dump(
            exclude_unset=True
        )

        for key, value in update_data.items():
            setattr(
                db_order,
                key,
                value
            )

        db.commit()
        db.refresh(db_order)

        return db_order

    @staticmethod
    def delete(
        db: Session,
        db_order: OrderList
    ):
        db.delete(db_order)
        db.commit()

        return {
            "message": "Order recommendation deleted successfully."
        }

    @staticmethod
    def filter_orders(
        db: Session,
        retailer_id: int | None = None,
        status: str | None = None
    ):
        """
        Filter order recommendations.
        """

        query = db.query(OrderList)

        if retailer_id is not None:
            query = query.filter(
                OrderList.retailer_id == retailer_id
            )

        if status is not None:
            query = query.filter(
                OrderList.status == status
            )

        return query.all()

    @staticmethod
    def approve(
        db: Session,
        db_order: OrderList,
        approved_by: str = "System"
    ):
        """
        Approve an order recommendation.
        """

        db_order.status = "approved"
        db_order.approved_by = approved_by
        db_order.approved_at = datetime.utcnow()

        db.commit()
        db.refresh(db_order)

        return db_order

    @staticmethod
    def reject(
        db: Session,
        db_order: OrderList,
        approved_by: str = "System"
    ):
        """
        Reject an order recommendation.
        """

        db_order.status = "rejected"
        db_order.approved_by = approved_by
        db_order.approved_at = datetime.utcnow()

        db.commit()
        db.refresh(db_order)

        return db_order

    @staticmethod
    def get_analytics(
        db: Session
    ):
        orders = db.query(OrderList).all()

        return {
            "total_orders": len(orders),
            "pending_orders": sum(
                1 for o in orders if o.status == "pending"
            ),
            "approved_orders": sum(
                1 for o in orders if o.status == "approved"
            ),
            "rejected_orders": sum(
                1 for o in orders if o.status == "rejected"
            )
        }