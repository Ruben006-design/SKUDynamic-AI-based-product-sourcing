from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends

from app.database.database import get_db

from app.weight_config.schemas import (
    WeightConfigCreate,
    WeightConfigUpdate,
    WeightConfigResponse
)

from app.weight_config.service import WeightConfigService

router = APIRouter(
    prefix="/weight-configs",
    tags=["Weight Configurations"]
)


@router.post(
    "",
    response_model=WeightConfigResponse,
    status_code=201
)
def create_weight_config(
    config: WeightConfigCreate,
    db: Session = Depends(get_db)
):
    return WeightConfigService.create_config(
        db,
        config
    )


@router.get(
    "",
    response_model=list[WeightConfigResponse]
)
def get_all_weight_configs(
    db: Session = Depends(get_db)
):
    return WeightConfigService.get_all_configs(db)


@router.get(
    "/{config_id}",
    response_model=WeightConfigResponse
)
def get_weight_config(
    config_id: int,
    db: Session = Depends(get_db)
):
    return WeightConfigService.get_config_by_id(
        db,
        config_id
    )


@router.put(
    "/{config_id}",
    response_model=WeightConfigResponse
)
def update_weight_config(
    config_id: int,
    config: WeightConfigUpdate,
    db: Session = Depends(get_db)
):
    return WeightConfigService.update_config(
        db,
        config_id,
        config
    )


@router.delete(
    "/{config_id}"
)
def delete_weight_config(
    config_id: int,
    db: Session = Depends(get_db)
):
    return WeightConfigService.delete_config(
        db,
        config_id
    )
    
@router.put("/retailer/{retailer_id}/profile")
def update_retailer_weight_profile(
    retailer_id: int,
    request: WeightConfigUpdate,
    db: Session = Depends(get_db)
):
    return WeightConfigService.update_retailer_weight_profile(
        db,
        retailer_id,
        request
    )