
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends
from app.database.database import get_db
from app.product.schemas import (
    ProductCreate,
    ProductUpdate,
    ProductResponse
)
from app.product.service import ProductService

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


@router.post(
    "",
    response_model=ProductResponse,
    status_code=201
)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db)
):
    return ProductService.create_product(db, product)


@router.get(
    "",
    response_model=list[ProductResponse]
)
def get_all_products(
    db: Session = Depends(get_db)
):
    return ProductService.get_all_products(db)


@router.get(
    "/{product_id}",
    response_model=ProductResponse
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    return ProductService.get_product_by_id(
        db,
        product_id
    )


@router.put(
    "/{product_id}",
    response_model=ProductResponse
)
def update_product(
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db)
):
    return ProductService.update_product(
        db,
        product_id,
        product
    )


@router.delete(
    "/{product_id}"
)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    return ProductService.delete_product(
        db,
        product_id
    )