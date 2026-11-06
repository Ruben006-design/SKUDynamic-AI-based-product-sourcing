from typing import Optional

from sqlalchemy import func, case
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
        Kept for backwards compatibility — prefer get_active_order_for_product.
        """
        return (
            db.query(OrderList)
            .filter(
                OrderList.weightage_id == weightage_id
            )
            .first()
        )

    ACTIVE_ORDER_STATUSES = ["pending", "approved", "ordered"]

    @staticmethod
    def get_active_order_for_product(
        db: Session,
        product_id: int,
        retailer_id: int
    ) -> Optional[OrderList]:
        """
        Returns an active (pending, approved, or ordered) order for a product,
        preventing duplicate orders regardless of which weightage generated them.
        """
        return (
            db.query(OrderList)
            .filter(
                OrderList.product_id == product_id,
                OrderList.retailer_id == retailer_id,
                OrderList.status.in_(OrderListRepository.ACTIVE_ORDER_STATUSES)
            )
            .first()
        )

    @staticmethod
    def get_pending_quantity_for_product(
        db: Session,
        product_id: int,
        retailer_id: int
    ) -> int:
        """
        Returns total quantity already on order (pending, approved, and ordered).
        Used to avoid over-ordering when orders are already in flight.
        """
        result = (
            db.query(func.sum(OrderList.recommended_order_qty))
            .filter(
                OrderList.product_id == product_id,
                OrderList.retailer_id == retailer_id,
                OrderList.status.in_(OrderListRepository.ACTIVE_ORDER_STATUSES)
            )
            .scalar()
        )
        return int(result or 0)

    @staticmethod
    def get_on_order_quantity_for_product(
        db: Session,
        product_id: int,
        retailer_id: int
    ) -> int:
        """Alias for get_pending_quantity_for_product."""
        return OrderListRepository.get_pending_quantity_for_product(db, product_id, retailer_id)

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
        db_order.approved_at = datetime.now()

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
        db_order.approved_at = datetime.now()

        db.commit()
        db.refresh(db_order)

        return db_order

    @staticmethod
    def get_analytics(db: Session) -> dict:
        """
        Returns order counts by status using SQL aggregation.
        Avoids loading all rows into Python memory.
        """
        result = db.query(
            func.count(OrderList.order_list_id).label("total"),
            func.sum(
                case((OrderList.status == "pending", 1), else_=0)
            ).label("pending"),
            func.sum(
                case((OrderList.status == "approved", 1), else_=0)
            ).label("approved"),
            func.sum(
                case((OrderList.status == "rejected", 1), else_=0)
            ).label("rejected"),
        ).one()

        return {
            "total_orders": int(result.total or 0),
            "pending_orders": int(result.pending or 0),
            "approved_orders": int(result.approved or 0),
            "rejected_orders": int(result.rejected or 0),
        }
