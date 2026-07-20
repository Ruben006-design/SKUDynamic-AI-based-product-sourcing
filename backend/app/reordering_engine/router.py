from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.reordering_engine.schemas import (
    ReorderingRequest,
    ReorderingResponse, ReorderRecommendation
)
from app.reordering_engine.service import (
    ReorderingEngineService
)

router = APIRouter(
    prefix="/reordering-engine",
    tags=["Reordering Engine"]
)


@router.post(
    "/generate",
    response_model=ReorderingResponse
)
def generate_recommendations(
    request: ReorderingRequest,
    db: Session = Depends(get_db)
):
    return ReorderingEngineService.generate_recommendations(
        db,
        request.retailer_id,
        request.config_id
    )

@router.post(
    "/generate/batch",
    response_model=ReorderingResponse
)
def generate_batch_recommendations(
    request: ReorderingRequest,
    db: Session = Depends(get_db)
):
    return (
        ReorderingEngineService
        .generate_batch_recommendations(
            db=db,
            retailer_id=request.retailer_id,
            config_id=request.config_id,
            product_ids=request.product_ids
        )
    )
@router.post(
    "/generate/{product_id}",
    response_model=ReorderRecommendation
)
def generate_single_recommendation(
    product_id: int,
    request: ReorderingRequest,
    db: Session = Depends(get_db)
):
    return (
        ReorderingEngineService
        .generate_single_recommendation(
            db=db,
            retailer_id=request.retailer_id,
            config_id=request.config_id,
            product_id=product_id
        )
    )
