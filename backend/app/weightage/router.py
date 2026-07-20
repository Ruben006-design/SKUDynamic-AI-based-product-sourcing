from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends

from app.database.database import get_db

from app.weightage.schemas import (
    WeightageCreate,
    WeightageUpdate,
    WeightageResponse,
    WeightValidationResponse
)

from app.weightage.service import WeightageService


router = APIRouter(
    prefix="/weightages",
    tags=["Weightage"]
)


@router.post(
    "",
    response_model=WeightageResponse,
    status_code=201
)
def create_weightage(
    weightage: WeightageCreate,
    db: Session = Depends(get_db)
):
    return WeightageService.create_weightage(
        db,
        weightage
    )


@router.get(
    "",
    response_model=list[WeightageResponse]
)
def get_all_weightages(
    db: Session = Depends(get_db)
):
    return WeightageService.get_all_weightages(
        db
    )


@router.get(
    "/{weightage_id}",
    response_model=WeightageResponse
)
def get_weightage(
    weightage_id: int,
    db: Session = Depends(get_db)
):
    return WeightageService.get_weightage_by_id(
        db,
        weightage_id
    )


@router.put(
    "/{weightage_id}",
    response_model=WeightageResponse
)
def update_weightage(
    weightage_id: int,
    weightage: WeightageUpdate,
    db: Session = Depends(get_db)
):
    return WeightageService.update_weightage(
        db,
        weightage_id,
        weightage
    )


@router.delete(
    "/{weightage_id}"
)
def delete_weightage(
    weightage_id: int,
    db: Session = Depends(get_db)
):
    return WeightageService.delete_weightage(
        db,
        weightage_id
    )

@router.get("/product/{product_id}")
def get_latest_weightage(
    product_id: int,
    db: Session = Depends(get_db)
):
    return WeightageService.get_latest_weightage(
        db,
        product_id
    )

@router.get(
    "/history/{product_id}",
    response_model=list[WeightageResponse]
)
def get_weightage_history(
    product_id: int,
    db: Session = Depends(get_db)
):
    return WeightageService.get_weightage_history(
        db,
        product_id
    )

@router.post(
    "/validate/{weightage_id}",
    response_model=WeightValidationResponse
)
def validate_weightage(
    weightage_id: int,
    db: Session = Depends(get_db)
):
    return WeightageService.validate_weightage(
        db,
        weightage_id
    )

@router.post(
    "/validate/{weightage_id}",
    response_model=WeightValidationResponse
)
def validate_weightage(
    weightage_id: int,
    db: Session = Depends(get_db)
):
    return WeightageService.validate_weightage(
        db,
        weightage_id
    )
@router.get("/retailer/{retailer_id}/profile")
def get_retailer_weight_profile(
    retailer_id: int,
    db: Session = Depends(get_db)
):
    return WeightageService.get_retailer_weight_profile(
        db,
        retailer_id
    )