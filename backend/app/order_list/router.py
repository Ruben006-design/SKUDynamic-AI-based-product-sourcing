

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.order_list.schemas import (
    OrderListCreate,
    OrderListUpdate,
    OrderListResponse,
    OrderAnalyticsResponse
)
from app.order_list.service import OrderListService

router = APIRouter(
    prefix="/order-list",
    tags=["Order List"]
)



@router.post(
    "",
    response_model=OrderListResponse,
    status_code=201
)
def create_order(
    order: OrderListCreate,
    db: Session = Depends(get_db)
):
    return OrderListService.create_order(
        db,
        order
    )



@router.get(
    "",
    response_model=list[OrderListResponse]
)
def get_orders(
    retailer_id: int | None = None,
    status: str | None = None,
    db: Session = Depends(get_db)
):
    if retailer_id is None and status is None:
        return OrderListService.get_all_orders(db)

    return OrderListService.filter_orders(
        db,
        retailer_id,
        status
    )



@router.get(
    "/analytics",
    response_model=OrderAnalyticsResponse
)
def get_order_analytics(
    db: Session = Depends(get_db)
):
    return OrderListService.get_order_analytics(
        db
    )



@router.get(
    "/export/csv"
)
def export_orders_csv(
    db: Session = Depends(get_db)
):
    return OrderListService.export_orders_csv(
        db
    )


@router.get(
    "/{order_list_id}",
    response_model=OrderListResponse
)
def get_order(
    order_list_id: int,
    db: Session = Depends(get_db)
):
    return OrderListService.get_order_by_id(
        db,
        order_list_id
    )



@router.put(
    "/{order_list_id}",
    response_model=OrderListResponse
)
def update_order(
    order_list_id: int,
    order: OrderListUpdate,
    db: Session = Depends(get_db)
):
    return OrderListService.update_order(
        db,
        order_list_id,
        order
    )



@router.delete(
    "/{order_list_id}"
)
def delete_order(
    order_list_id: int,
    db: Session = Depends(get_db)
):
    return OrderListService.delete_order(
        db,
        order_list_id
    )

@router.put(
    "/{order_list_id}/approve",
    response_model=OrderListResponse
)
def approve_order(
    order_list_id: int,
    db: Session = Depends(get_db)
):
    return OrderListService.approve_order(
        db,
        order_list_id
    )

@router.put(
    "/{order_list_id}/reject",
    response_model=OrderListResponse
)
def reject_order(
    order_list_id: int,
    db: Session = Depends(get_db)
):
    return OrderListService.reject_order(
        db,
        order_list_id
    )
