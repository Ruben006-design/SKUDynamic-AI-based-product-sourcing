import logging
import csv
from io import StringIO
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.exceptions.custom_exceptions import (
    OrderListNotFoundException
)
from app.order_list.repository import OrderListRepository
from app.order_list.schemas import (
    OrderListCreate,
    OrderListUpdate
)
from app.order_list.repository import (
    OrderListRepository
)


from app.order_list.schemas import (
    OrderListCreate
)
logger = logging.getLogger(__name__)


class OrderListService:
    """
    Contains business logic for Order List.
    """

    @staticmethod
    def create_order(
        db: Session,
        order: OrderListCreate
    ):
        logger.info("Creating order recommendation.")

        return OrderListRepository.create(
            db,
            order
        )

    @staticmethod
    def get_all_orders(
        db: Session
    ):
        return OrderListRepository.get_all(db)

    @staticmethod
    def get_order_by_id(
        db: Session,
        order_list_id: int
    ):
        order = OrderListRepository.get_by_id(
            db,
            order_list_id
        )

        if order is None:
            logger.warning(
                f"Order recommendation {order_list_id} not found."
            )
            raise OrderListNotFoundException(
                order_list_id
            )

        return order

    @staticmethod
    def update_order(
        db: Session,
        order_list_id: int,
        order_data: OrderListUpdate
    ):
        logger.info(
            f"Updating order recommendation {order_list_id}"
        )

        order = OrderListRepository.get_by_id(
            db,
            order_list_id
        )

        if order is None:
            logger.warning(
                f"Order recommendation {order_list_id} not found."
            )
            raise OrderListNotFoundException(
                order_list_id
            )

        return OrderListRepository.update(
            db,
            order,
            order_data
        )

    @staticmethod
    def delete_order(
        db: Session,
        order_list_id: int
    ):
        logger.info(
            f"Deleting order recommendation {order_list_id}"
        )

        order = OrderListRepository.get_by_id(
            db,
            order_list_id
        )

        if order is None:
            logger.warning(
                f"Order recommendation {order_list_id} not found."
            )
            raise OrderListNotFoundException(
                order_list_id
            )

        return OrderListRepository.delete(
            db,
            order
        )

    @staticmethod
    def filter_orders(
        db: Session,
        retailer_id: int | None = None,
        status: str | None = None
    ):
        return OrderListRepository.filter_orders(
            db,
            retailer_id,
            status
        )

    @staticmethod
    def approve_order(
        db: Session,
        order_list_id: int
    ):
        logger.info(
            "Approving order %s",
            order_list_id
        )

        order = OrderListRepository.get_by_id(
            db,
            order_list_id
        )

        if order is None:
            raise OrderListNotFoundException(
                order_list_id
            )

        return OrderListRepository.approve(
            db,
            order
        )

    @staticmethod
    def reject_order(
        db: Session,
        order_list_id: int
    ):
        logger.info(
            "Rejecting order %s",
            order_list_id
        )

        order = OrderListRepository.get_by_id(
            db,
            order_list_id
        )

        if order is None:
            raise OrderListNotFoundException(
                order_list_id
            )

        return OrderListRepository.reject(
            db,
            order
        )

    @staticmethod
    def export_orders_csv(
        db: Session
    ):
        """
        Export all order recommendations as CSV.
        """

        orders = OrderListRepository.get_all(db)

        output = StringIO()

        writer = csv.writer(output)

        writer.writerow([
            "Order ID",
            "Product ID",
            "Retailer ID",
            "Supplier ID",
            "Quantity",
            "Score",
            "Status",
            "Approved By",
            "Approved At"
        ])

        for order in orders:
            writer.writerow([
                order.order_list_id,
                order.product_id,
                order.retailer_id,
                order.preferred_supplier_id,
                order.recommended_order_qty,
                order.final_score,
                order.status,
                order.approved_by,
                order.approved_at
            ])

        output.seek(0)

        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition":
                "attachment; filename=order_list.csv"
            }
        )

    @staticmethod
    def get_order_analytics(
        db: Session
    ):
        return OrderListRepository.get_analytics(db)