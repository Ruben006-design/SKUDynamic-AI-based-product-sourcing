from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends

from app.database.database import get_db
from app.supplier.schemas import (
    SupplierCreate,
    SupplierUpdate,
    SupplierResponse,
)
from app.supplier.service import SupplierService


router = APIRouter(
    prefix="/suppliers",
    tags=["Suppliers"]
)


@router.post(
    "",
    response_model=SupplierResponse,
    status_code=201
)
def create_supplier(
    supplier: SupplierCreate,
    db: Session = Depends(get_db)
):
    return SupplierService.create_supplier(
        db,
        supplier
    )


@router.get(
    "",
    response_model=list[SupplierResponse]
)
def get_all_suppliers(
    db: Session = Depends(get_db)
):
    return SupplierService.get_all_suppliers(db)


@router.get(
    "/{supplier_id}",
    response_model=SupplierResponse
)
def get_supplier(
    supplier_id: int,
    db: Session = Depends(get_db)
):
    return SupplierService.get_supplier_by_id(
        db,
        supplier_id
    )


@router.put(
    "/{supplier_id}",
    response_model=SupplierResponse
)
def update_supplier(
    supplier_id: int,
    supplier: SupplierUpdate,
    db: Session = Depends(get_db)
):
    return SupplierService.update_supplier(
        db,
        supplier_id,
        supplier
    )


@router.delete(
    "/{supplier_id}"
)
def delete_supplier(
    supplier_id: int,
    db: Session = Depends(get_db)
):
    return SupplierService.delete_supplier(
        db,
        supplier_id
    )