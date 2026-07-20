from datetime import datetime

from pydantic import BaseModel, ConfigDict


class WeightageCreate(BaseModel):
    """
    Schema used to create a weightage record.
    """

    product_id: int
    retailer_id: int
    config_id: int | None = None

    sales_volume_weight: float
    lead_time_weight: float
    supplier_quality_weight: float
    popularity_weight: float
    weather_weight: float
    festival_demand_weight: float
    durability_weight: float
    expiry_weight: float

    recommendation_score: float | None = None
    llm_model_used: str | None = None


class WeightageUpdate(BaseModel):
    """
    Schema used to update a weightage record.
    """

    product_id: int | None = None
    retailer_id: int | None = None
    config_id: int | None = None

    sales_volume_weight: float | None = None
    lead_time_weight: float | None = None
    supplier_quality_weight: float | None = None
    popularity_weight: float | None = None
    weather_weight: float | None = None
    festival_demand_weight: float | None = None
    durability_weight: float | None = None
    expiry_weight: float | None = None

    recommendation_score: float | None = None
    llm_model_used: str | None = None


class WeightageResponse(BaseModel):
    """
    Schema returned to the client.
    """

    weightage_id: int
    product_id: int
    retailer_id: int
    config_id: int | None

    sales_volume_weight: float
    lead_time_weight: float
    supplier_quality_weight: float
    popularity_weight: float
    weather_weight: float
    festival_demand_weight: float
    durability_weight: float
    expiry_weight: float

    recommendation_score: float | None
    llm_model_used: str | None

    generated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )
class WeightValidationResponse(BaseModel):
    """
    Response after validating a weightage.
    """

    weightage_id: int
    valid: bool
    message: str