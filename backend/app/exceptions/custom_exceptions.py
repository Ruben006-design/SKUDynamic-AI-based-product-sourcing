from fastapi import HTTPException, status


class RetailerNotFoundException(HTTPException):
    """
    Exception raised when a retailer is not found.
    """

    def __init__(self, retailer_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Retailer with ID {retailer_id} was not found."
        )

class ProductNotFoundException(Exception):
    def __init__(self, product_id: int):
        self.product_id = product_id
        self.message = f"Product with ID {product_id} not found"
        super().__init__(self.message)
class RetailerAlreadyExistsException(HTTPException):
    """
    Exception raised when attempting to create a duplicate retailer.
    """

    def __init__(self):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail="Retailer already exists."
        )

class SupplierNotFoundException(Exception):
    """
    Raised when a supplier is not found.
    """

    def __init__(self, supplier_id: int):
        self.supplier_id = supplier_id

class ProductSupplierNotFoundException(Exception):
    """
    Raised when a product-supplier
    relationship is not found.
    """

    def __init__(
        self,
        product_supplier_id: int
    ):
        self.product_supplier_id = (
            product_supplier_id
        )

class InventoryNotFoundException(Exception):
    def __init__(self, inventory_id: int):
        self.inventory_id = inventory_id

class SalesNotFoundException(Exception):
    """
    Raised when a sale is not found.
    """

    def __init__(self, sale_id: int):
        self.sale_id = sale_id
        super().__init__(
            f"Sale with ID {sale_id} was not found."
        )

class WeightConfigNotFoundException(Exception):
    """
    Raised when a weight configuration is not found.
    """

    def __init__(self, config_id: int):
        self.config_id = config_id
        super().__init__(
            f"Weight configuration with ID {config_id} was not found."
        )

class InvalidWeightageException(Exception):
    """
    Raised when the total weight is not equal to 1.00.
    """

    def __init__(self, total: float):
        self.total = total

class WeightageNotFoundException(Exception):
    """
    Raised when a weightage record is not found.
    """

    def __init__(self, weightage_id: int):
        self.weightage_id = weightage_id
        super().__init__(
            f"Weightage with ID {weightage_id} not found."
        )

class HumanEvaluationNotFoundException(Exception):
    """
    Raised when a Human Evaluation is not found.
    """

    def __init__(self, eval_id: int):
        self.eval_id = eval_id
        super().__init__(
            f"Human Evaluation with ID {eval_id} not found."
        )

class OrderListNotFoundException(Exception):
    """
    Raised when an order recommendation is not found.
    """

    def __init__(self, order_list_id: int):
        self.order_list_id = order_list_id
        super().__init__(
            f"Order recommendation with ID {order_list_id} not found."
        )
        