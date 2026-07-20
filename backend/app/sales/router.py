from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends

from app.database.database import get_db
from datetime import date
from fastapi import Query
from app.sales.schemas import (
    SalesCreate,
    SalesUpdate,
    SalesResponse
)

from app.sales.service import SalesService
router = APIRouter(
    prefix="/sales",
    tags=["Sales"]
)
@router.post(
    "",
    response_model=SalesResponse,
    status_code=201
)
def create_sale(
    sale: SalesCreate,
    db: Session = Depends(get_db)
):
    return SalesService.create_sale(
        db,
        sale
    )
@router.get(
    "",
    response_model=list[SalesResponse]
)
def get_all_sales(
    product_id: int | None = Query(default=None),
    from_date: date | None = Query(default=None, alias="from"),
    to_date: date | None = Query(default=None, alias="to"),
    db: Session = Depends(get_db)
):
    """
    Get all sales or filter them using query parameters.
    """

    return SalesService.get_sales_history(
        db,
        product_id,
        from_date,
        to_date
    )
@router.get(
    "/{sale_id}",
    response_model=SalesResponse
)
def get_sale(
    sale_id: int,
    db: Session = Depends(get_db)
):
    return SalesService.get_sale_by_id(
        db,
        sale_id
    )
@router.put(
    "/{sale_id}",
    response_model=SalesResponse
)
def update_sale(
    sale_id: int,
    sale: SalesUpdate,
    db: Session = Depends(get_db)
):
    return SalesService.update_sale(
        db,
        sale_id,
        sale
    )
@router.delete(
    "/{sale_id}"
)
def delete_sale(
    sale_id: int,
    db: Session = Depends(get_db)
):
    return SalesService.delete_sale(
        db,
        sale_id
    )
