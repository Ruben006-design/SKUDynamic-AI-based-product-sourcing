from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field
from decimal import Decimal

class RetailerBase(BaseModel):
    """
    Common fields shared by multiple Retailer schemas.
    """

    retailer_name: str = Field(..., min_length=2, max_length=255)
    industry_type: Optional[str] = Field(default=None, max_length=100)
    contact_email: Optional[EmailStr] = None
    plan_tier: str = Field(default="starter")


class RetailerCreate(RetailerBase):
    """
    Schema used when creating a retailer.
    """
    pass


class RetailerUpdate(BaseModel):
    """
    Schema used when updating a retailer.
    """

    retailer_name: Optional[str] = Field(default=None, min_length=2, max_length=255)
    industry_type: Optional[str] = Field(default=None, max_length=100)
    contact_email: Optional[EmailStr] = None
    plan_tier: Optional[str] = None


class RetailerResponse(RetailerBase):
    """
    Schema returned to API clients.
    """

    retailer_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

