from datetime import datetime

from pydantic import BaseModel, ConfigDict


class OrderListBase(BaseModel):
    """
    Shared fields for Order List.
    """

    product_id: int
    weightage_id: int
    retailer_id: int
    preferred_supplier_id: int | None = None

    recommended_order_qty: int | None = None
    final_score: float | None = None
    justification_summary: str | None = None

    status: str = "pending"

    approved_by: str | None = None
    approved_at: datetime | None = None


class OrderListCreate(OrderListBase):
    """
    Schema for creating an order recommendation.
    """
    pass


class OrderListUpdate(BaseModel):
    """
    Schema for updating an order recommendation.
    """

    preferred_supplier_id: int | None = None
    recommended_order_qty: int | None = None
    final_score: float | None = None
    justification_summary: str | None = None

    status: str | None = None

    approved_by: str | None = None
    approved_at: datetime | None = None


class OrderListResponse(OrderListBase):
    """
    Schema returned to clients.
    """

    order_list_id: int
    generated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )

class OrderAnalyticsResponse(BaseModel):
    total_orders: int
    pending_orders: int
    approved_orders: int
    rejected_orders: int