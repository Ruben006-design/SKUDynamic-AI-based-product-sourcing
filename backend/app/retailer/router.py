from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.retailer.schemas import (
    RetailerCreate,
    RetailerUpdate,
    RetailerResponse
)
from app.retailer.service import RetailerService

router = APIRouter(
    prefix="/retailers",
    tags=["Retailers"]
)


@router.post(
    "",
    response_model=RetailerResponse,
    status_code=201
)
def create_retailer(
    retailer: RetailerCreate,
    db: Session = Depends(get_db)
):
    return RetailerService.create_retailer(db, retailer)


@router.get(
    "",
    response_model=List[RetailerResponse]
)
def get_all_retailers(
    db: Session = Depends(get_db)
):
    return RetailerService.get_all_retailers(db)


@router.get(
    "/{retailer_id}",
    response_model=RetailerResponse
)
def get_retailer(
    retailer_id: int,
    db: Session = Depends(get_db)
):
    return RetailerService.get_retailer_by_id(
        db,
        retailer_id
    )

@router.put(
    "/{retailer_id}",
    response_model=RetailerResponse,
    summary="Update a retailer"
)
def update_retailer(
    retailer_id: int,
    retailer_data: RetailerUpdate,
    db: Session = Depends(get_db)
):
    return RetailerService.update_retailer(
        db,
        retailer_id,
        retailer_data
    )