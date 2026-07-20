from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends

from app.database.database import get_db

from app.product_supplier.schemas import (
    ProductSupplierCreate,
    ProductSupplierUpdate,
    ProductSupplierResponse,
)

from app.product_supplier.service import (
    ProductSupplierService,
)

router = APIRouter(
    prefix="/product-suppliers",
    tags=["Product Suppliers"],
)


@router.post(
    "",
    response_model=ProductSupplierResponse,
    status_code=201,
)
def create_product_supplier(
    product_supplier: ProductSupplierCreate,
    db: Session = Depends(get_db),
):
    return (
        ProductSupplierService
        .create_product_supplier(
            db,
            product_supplier,
        )
    )


@router.get(
    "",
    response_model=list[
        ProductSupplierResponse
    ],
)
def get_all_product_suppliers(
    db: Session = Depends(get_db),
):
    return (
        ProductSupplierService
        .get_all_product_suppliers(
            db
        )
    )


@router.get(
    "/{product_supplier_id}",
    response_model=
        ProductSupplierResponse,
)
def get_product_supplier(
    product_supplier_id: int,
    db: Session = Depends(get_db),
):
    return (
        ProductSupplierService
        .get_product_supplier_by_id(
            db,
            product_supplier_id,
        )
    )


@router.put(
    "/{product_supplier_id}",
    response_model=
        ProductSupplierResponse,
)
def update_product_supplier(
    product_supplier_id: int,
    product_supplier:
        ProductSupplierUpdate,
    db: Session = Depends(get_db),
):
    return (
        ProductSupplierService
        .update_product_supplier(
            db,
            product_supplier_id,
            product_supplier,
        )
    )
@router.delete(
    "/{product_supplier_id}"
)
def delete_product_supplier(
    product_supplier_id: int,
    db: Session = Depends(get_db),
):
    return (
        ProductSupplierService
        .delete_product_supplier(
            db,
            product_supplier_id,
        )
    )