from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    """
    Common fields shared across Product schemas.
    """

    retailer_id: int

    product_name: str = Field(
        min_length=2,
        max_length=255
    )

    category: str | None = Field(
        default=None,
        max_length=100
    )

    sku_code: str = Field(
        min_length=1,
        max_length=100
    )

    durability_days: int | None = Field(
        default=None,
        ge=0
    )

    expiry_date: date | None = None

    unit_cost: Decimal | None = Field(
        default=None,
        ge=0
    )


class ProductCreate(ProductBase):
    """
    Schema used to create a Product.
    """
    pass


class ProductUpdate(BaseModel):
    """
    Schema used to update a Product.
    """

    retailer_id: int | None = None

    product_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=255
    )

    category: str | None = Field(
        default=None,
        max_length=100
    )

    sku_code: str | None = Field(
        default=None,
        min_length=1,
        max_length=100
    )

    durability_days: int | None = Field(
        default=None,
        ge=0
    )

    expiry_date: date | None = None

    unit_cost: Decimal | None = Field(
        default=None,
        ge=0
    )


class ProductResponse(ProductBase):
    """
    Schema returned to the client.
    """

    product_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)