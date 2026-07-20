from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class SalesBase(BaseModel):
    """
    Base schema for Sales.
    """

    product_id: int
    retailer_id: int
    sale_date: date
    quantity_sold: Optional[int] = Field(default=None, ge=0)
    revenue: Optional[Decimal] = Field(default=None, ge=0)
    popularity_score: Optional[int] = Field(
        default=None,
        ge=1,
        le=10
    )
    sales_channel: Optional[str] = Field(
        default=None,
        max_length=100
    )


class SalesCreate(SalesBase):
    """
    Schema used when creating a sales record.
    """
    pass


class SalesUpdate(BaseModel):
    """
    Schema used when updating a sales record.
    """

    product_id: Optional[int] = None
    retailer_id: Optional[int] = None
    sale_date: Optional[date] = None
    quantity_sold: Optional[int] = Field(default=None, ge=0)
    revenue: Optional[Decimal] = Field(default=None, ge=0)
    popularity_score: Optional[int] = Field(
        default=None,
        ge=1,
        le=10
    )
    sales_channel: Optional[str] = Field(
        default=None,
        max_length=100
    )


class SalesResponse(SalesBase):
    """
    Schema returned to the client.
    """

    sale_id: int

    model_config = ConfigDict(
        from_attributes=True
    )