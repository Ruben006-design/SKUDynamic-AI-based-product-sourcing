from fastapi import APIRouter

from app.weightage_engine.schemas import (
    WeightageGenerationRequest,
    WeightageGenerationResponse
)
from sqlalchemy.orm import Session
from fastapi import Depends

from app.database.database import get_db
from app.weightage_engine.service import (
    WeightageEngineService
)
from app.weightage_engine.schemas import (
    LLMPromptRequest
)
router = APIRouter(
    prefix="/weightage-engine",
    tags=["Weightage Engine"]
)

@router.post(
    "/generate",
    response_model=WeightageGenerationResponse
)
def generate_weightage(
    request: WeightageGenerationRequest,
    db: Session = Depends(get_db)
):
    return WeightageEngineService.generate_weightage(
        db,
        request
    )
@router.post(
    "/generate/batch",
    response_model=WeightageGenerationResponse
)
def generate_batch_weightage(
    request: WeightageGenerationRequest,
    db: Session = Depends(get_db)
):
    return WeightageEngineService.generate_batch_weightage(
        db,
        request
    )
@router.post("/generate/{product_id}")
def generate_single_weightage(
    product_id: int,
    request: WeightageGenerationRequest,
    db: Session = Depends(get_db)
):
    return WeightageEngineService.generate_single_weightage(
        db=db,
        product_id=product_id,
        request=request
    )
@router.post("/llm/prompt")
def generate_llm_prompt(
    request: LLMPromptRequest,
    db: Session = Depends(get_db)
):
    return WeightageEngineService.generate_llm_prompt(
        db,
        request
    )
