from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class HumanEvaluationBase(BaseModel):
    """
    Common fields shared across Human Evaluation schemas.
    """

    weightage_id: int
    retailer_id: int
    field_name: str
    old_value: Decimal | None = None
    new_value: Decimal | None = None
    override_reason: str | None = None
    evaluated_by: str | None = None


class HumanEvaluationCreate(HumanEvaluationBase):
    """
    Schema used when creating a Human Evaluation.
    """
    pass


class HumanEvaluationUpdate(BaseModel):
    """
    Schema used when updating a Human Evaluation.
    """

    field_name: str | None = None
    old_value: Decimal | None = None
    new_value: Decimal | None = None
    override_reason: str | None = None
    evaluated_by: str | None = None


class HumanEvaluationResponse(HumanEvaluationBase):
    """
    Schema returned in API responses.
    """

    eval_id: int
    evaluated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )