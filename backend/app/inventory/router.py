from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.inventory.schemas import (
    InventoryCreate,
    InventoryUpdate,
    InventoryResponse,
)
from app.inventory.service import InventoryService

router = APIRouter(
    prefix="/inventories",
    tags=["Inventories"]
)


@router.post(
    "",
    response_model=InventoryResponse,
    status_code=201
)
def create_inventory(
    inventory: InventoryCreate,
    db: Session = Depends(get_db)
):
    return InventoryService.create_inventory(
        db,
        inventory
    )


@router.get(
    "",
    response_model=list[InventoryResponse]
)
def get_all_inventories(
    db: Session = Depends(get_db)
):
    return InventoryService.get_all_inventories(
        db
    )


@router.get(
    "/{inventory_id}",
    response_model=InventoryResponse
)
def get_inventory(
    inventory_id: int,
    db: Session = Depends(get_db)
):
    return InventoryService.get_inventory_by_id(
        db,
        inventory_id
    )


@router.put(
    "/{inventory_id}",
    response_model=InventoryResponse
)
def update_inventory(
    inventory_id: int,
    inventory: InventoryUpdate,
    db: Session = Depends(get_db)
):
    return InventoryService.update_inventory(
        db,
        inventory_id,
        inventory
    )


@router.delete(
    "/{inventory_id}"
)
def delete_inventory(
    inventory_id: int,
    db: Session = Depends(get_db)
):
    return InventoryService.delete_inventory(
        db,
        inventory_id
    )
@router.get(
    "/product/{product_id}",
    response_model=InventoryResponse
)
def get_inventory_by_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """
    Get inventory using product ID.
    """
    return InventoryService.get_inventory_by_product_id(
        db,
        product_id
    )