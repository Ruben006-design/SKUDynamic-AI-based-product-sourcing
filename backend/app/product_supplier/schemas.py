from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ProductSupplierBase(BaseModel):
    """
    Base schema for ProductSupplier.
    """

    product_id: int
    supplier_id: int
    is_preferred: bool = False
    negotiated_price: Decimal | None = None
    contract_start: date | None = None
    contract_end: date | None = None


class ProductSupplierCreate(ProductSupplierBase):
    """
    Schema used to create a ProductSupplier.
    """
    pass


class ProductSupplierUpdate(BaseModel):
    """
    Schema used to update a ProductSupplier.
    """

    product_id: int | None = None
    supplier_id: int | None = None
    is_preferred: bool | None = None
    negotiated_price: Decimal | None = None
    contract_start: date | None = None
    contract_end: date | None = None


class ProductSupplierResponse(ProductSupplierBase):
    """
    Schema returned to the client.
    """

    product_supplier_id: int

    model_config = ConfigDict(
        from_attributes=True
    )