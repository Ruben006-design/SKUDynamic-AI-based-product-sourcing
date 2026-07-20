from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict


class InventoryCreate(BaseModel):
    """
    Schema for creating inventory.
    """

    product_id: int
    retailer_id: int
    current_stock: int = 0
    reserved_stock: int = 0
    reorder_point: int | None = None
    eoq: Decimal | None = None
    safety_stock: int | None = None


class InventoryUpdate(BaseModel):
    """
    Schema for updating inventory.
    """

    current_stock: int | None = None
    reserved_stock: int | None = None
    reorder_point: int | None = None
    eoq: Decimal | None = None
    safety_stock: int | None = None


class InventoryResponse(BaseModel):
    """
    Schema returned to client.
    """

    inventory_id: int
    product_id: int
    retailer_id: int
    current_stock: int
    reserved_stock: int
    reorder_point: int | None
    eoq: Decimal | None
    safety_stock: int | None
    last_updated: datetime

    model_config = ConfigDict(
        from_attributes=True
    )