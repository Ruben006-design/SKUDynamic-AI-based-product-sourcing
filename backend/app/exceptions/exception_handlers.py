from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse
from app.exceptions.custom_exceptions import (
    RetailerNotFoundException,
    ProductNotFoundException,
    SupplierNotFoundException,
    ProductSupplierNotFoundException,
    InventoryNotFoundException,
    SalesNotFoundException,
    WeightConfigNotFoundException,
    WeightageNotFoundException,
    InvalidWeightageException, HumanEvaluationNotFoundException, OrderListNotFoundException
)
def register_exception_handlers(app: FastAPI):
    """
    Registers global exception handlers for the application.
    """

    @app.exception_handler(HTTPException)
    async def http_exception_handler(
        request: Request,
        exc: HTTPException
    ):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "message": exc.detail,
                "status_code": exc.status_code,
                "data": None
            }
        )

    @app.exception_handler(ProductNotFoundException)
    async def product_not_found_exception_handler(request: Request, exc: ProductNotFoundException):
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": f"Product with ID {exc.product_id} was not found.",
                "status_code": 404,
                "data": None
            }
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(
        request: Request,
        exc: Exception
    ):
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "Internal Server Error",
                "status_code": 500,
                "data": None
            }
        )
        
    
    @app.exception_handler(SupplierNotFoundException)
    async def supplier_not_found_exception_handler(
        request,
        exc
    ):
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": (
                f"Supplier with ID "
                f"{exc.supplier_id} "
                f"was not found."
                ),
                "status_code": 404,
                "data": None
            }
        )

    @app.exception_handler(ProductSupplierNotFoundException)
    async def product_supplier_not_found_handler(
        request,
        exc
    ):
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message":
                f"ProductSupplier "
                f"with ID "
                f"{exc.product_supplier_id} "
                f"was not found.",
                "status_code": 404,
                "data": None
            }
        )

    @app.exception_handler(InventoryNotFoundException)
    async def inventory_not_found_handler(
        request: Request,
        exc: InventoryNotFoundException
    ):
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message":
                f"Inventory with ID "
                f"{exc.inventory_id} "
                f"was not found.",
                "status_code": 404,
                "data": None
            }
        )

    @app.exception_handler(WeightConfigNotFoundException)
    async def weight_config_not_found_exception_handler(request, exc):
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": str(exc),
                "status_code": 404,
                "data": None
            }
        )

    @app.exception_handler(SalesNotFoundException)
    async def sales_not_found_exception_handler(request, exc):
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": str(exc),
                "status_code": 404,
                "data": None
            }
        )
    @app.exception_handler(InvalidWeightageException)
    async def invalid_weightage_exception_handler(
        request,
        exc: InvalidWeightageException
    ):
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "message": (
                f"Total weight must equal 1.00. "
                f"Current total = {exc.total:.2f}"
                ),
                "status_code": 400,
                "data": None
            }
        )
    @app.exception_handler(WeightageNotFoundException)
    async def weightage_not_found_exception_handler(
        request,
        exc: WeightageNotFoundException
    ):
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": str(exc),
                "status_code": 404,
                "data": None
            }
        )
    @app.exception_handler(HumanEvaluationNotFoundException)
    async def human_evaluation_not_found_exception_handler(
        request,
        exc: HumanEvaluationNotFoundException
    ):
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": str(exc),
                "status_code": 404,
                "data": None
            }
        )
    @app.exception_handler(OrderListNotFoundException)
    async def order_list_not_found_exception_handler(
        request,
        exc: OrderListNotFoundException
    ):
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": str(exc),
                "status_code": 404,
                "data": None
            }
        )