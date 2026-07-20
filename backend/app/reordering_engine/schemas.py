from datetime import datetime
from typing import List

from pydantic import BaseModel


class ReorderRecommendation(BaseModel):
    """
    Represents a single AI-generated reorder recommendation.
    """

    product_id: int
    product_name: str

    recommendation_score: float

    reorder_required: bool

    reorder_quantity: int

    supplier_id: int
    supplier_name: str

    estimated_lead_time: int

    generated_at: datetime


class ReorderingResponse(BaseModel):
    """
    Response returned by the Reordering Engine.
    """

    retailer_id: int

    total_products: int

    recommended_orders: int

    recommendations: List[ReorderRecommendation]

class ReorderingRequest(BaseModel):
    retailer_id: int
    config_id: int
    product_ids: list[int] | None = None