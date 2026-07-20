from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class SupplierBase(BaseModel):
    """
    Base supplier schema.
    """

    retailer_id: int
    supplier_name: str
    contact_person: str | None = None
    email: str | None = None
    phone: str | None = None
    lead_time_days: Decimal | None = None
    quality_score: Decimal | None = None


class SupplierCreate(SupplierBase):
    """
    Schema for creating a supplier.
    """
    pass


class SupplierUpdate(BaseModel):
    """
    Schema for updating a supplier.
    """

    retailer_id: int | None = None
    supplier_name: str | None = None
    contact_person: str | None = None
    email: str | None = None
    phone: str | None = None
    lead_time_days: Decimal | None = None
    quality_score: Decimal | None = None


class SupplierResponse(SupplierBase):
    """
    Schema returned to clients.
    """

    supplier_id: int

    model_config = ConfigDict(
        from_attributes=True
    )