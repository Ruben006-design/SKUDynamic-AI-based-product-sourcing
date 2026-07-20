from pydantic import BaseModel


class WeightageGenerationRequest(BaseModel):
    """
    Request to generate AI weightage.
    """

    retailer_id: int
    config_id: int

class WeightageGenerationResponse(BaseModel):
    """
    Response after AI generates weightages.
    """

    message: str
    total_products: int
    generated_weightage_ids: list[int]

class WeightageGenerationRequest(BaseModel):
    retailer_id: int
    config_id: int
    product_ids: list[int] | None = None

class LLMPromptRequest(BaseModel):
    retailer_id: int
    config_id: int
    product_id: int