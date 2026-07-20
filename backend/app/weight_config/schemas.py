
from pydantic import BaseModel, Field, ConfigDict


class WeightConfigCreate(BaseModel):
    """
    Schema used when creating a weight configuration.
    """

    retailer_id: int

    config_name: str = Field(
        min_length=2,
        max_length=100
    )

    sales_volume_w: float = 0.20
    lead_time_w: float = 0.15
    supplier_quality_w: float = 0.15
    popularity_w: float = 0.15
    weather_w: float = 0.10
    festival_demand_w: float = 0.10
    durability_w: float = 0.10
    expiry_w: float = 0.05

    is_active: bool = True


class WeightConfigUpdate(BaseModel):
    """
    Schema used when updating a weight configuration.
    """

    config_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    sales_volume_w: float | None = None
    lead_time_w: float | None = None
    supplier_quality_w: float | None = None
    popularity_w: float | None = None
    weather_w: float | None = None
    festival_demand_w: float | None = None
    durability_w: float | None = None
    expiry_w: float | None = None

    is_active: bool | None = None


class WeightConfigResponse(BaseModel):
    """
    Schema returned to the client.
    """

    config_id: int
    retailer_id: int
    config_name: str

    sales_volume_w: float
    lead_time_w: float
    supplier_quality_w: float
    popularity_w: float
    weather_w: float
    festival_demand_w: float
    durability_w: float
    expiry_w: float

    is_active: bool

    model_config = ConfigDict(
        from_attributes=True
    )

class WeightConfigUpdate(BaseModel):
    sales_volume_w: float
    lead_time_w: float
    supplier_quality_w: float
    popularity_w: float
    weather_w: float
    festival_demand_w: float
    durability_w: float
    expiry_w: float