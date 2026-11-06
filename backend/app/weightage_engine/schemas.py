from pydantic import BaseModel


class WeightageGenerationResponse(BaseModel):
    """
    Response after AI generates weightages.
    """

    message: str
    total_products: int
    generated_weightage_ids: list[int]


class WeightageGenerationRequest(BaseModel):
    """
    Request to generate AI weightage for one or more products.
    If product_ids is None, all products for the retailer are processed.
    """

    retailer_id: int
    config_id: int
    product_ids: list[int] | None = None


class LLMPromptRequest(BaseModel):
    retailer_id: int
    config_id: int
    product_id: int
