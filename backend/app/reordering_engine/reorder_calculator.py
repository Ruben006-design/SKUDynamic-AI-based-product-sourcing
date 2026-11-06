import math


class ReorderCalculator:
    """
    Handles reorder decision and quantity calculation using Inventory Position
    and Target Stock (Order-Up-To Level) logic.
    """

    @staticmethod
    def calculate_inventory_position(
        current_stock: int,
        on_order_qty: int = 0,
        backorders: int = 0
    ) -> int:
        """
        Calculates Inventory Position:
            Inventory Position = On-Hand Stock + On-Order Quantity - Backorders

        Parameters
        ----------
        current_stock : int
            On-hand physically available stock from Inventory.current_stock.
        on_order_qty  : int
            Quantity on existing pending, approved, or in-transit orders
            from Order_List.
        backorders    : int
            Documented limitation: The existing database schema does not have a
            backorders column or table; backorders default to 0.

        Returns
        -------
        int : Inventory position. Can be negative if backorders exceed on-hand
              plus on-order quantities (legitimate deficit position).
        
        Raises
        ------
        ValueError : If any input quantity is strictly negative.
        """
        if current_stock is not None and int(current_stock) < 0:
            raise ValueError(f"current_stock cannot be negative, got {current_stock}")
        if on_order_qty is not None and int(on_order_qty) < 0:
            raise ValueError(f"on_order_qty cannot be negative, got {on_order_qty}")
        if backorders is not None and int(backorders) < 0:
            raise ValueError(f"backorders cannot be negative, got {backorders}")

        on_hand = int(current_stock or 0)
        on_order = int(on_order_qty or 0)
        bo = int(backorders or 0)
        return on_hand + on_order - bo

    @staticmethod
    def calculate_target_stock(
        average_daily_sales: float,
        lead_time_days: int,
        safety_stock: int
    ) -> float:
        """
        Calculates Target Stock (Order-Up-To Level, S):
            Target Stock = Expected Demand During Replenishment Lead Time + Safety Stock

        Parameters
        ----------
        average_daily_sales : float
            Expected daily demand over the observation period.
        lead_time_days      : int
            Replenishment lead time in calendar days from the supplier.
        safety_stock        : int
            Safety buffer stock from Inventory.safety_stock.

        Returns
        -------
        float : Target inventory level.
        """
        lead_time_demand = float(average_daily_sales or 0.0) * max(0, int(lead_time_days or 0))
        return lead_time_demand + max(0, int(safety_stock or 0))

    @staticmethod
    def calculate_reorder_quantity(
        current_stock: int,
        average_daily_sales: float,
        lead_time_days: int,
        safety_stock: int,
        on_order_qty: int = 0,
        backorders: int = 0
    ) -> int:
        """
        Calculates the recommended reorder quantity:
            Reorder Quantity = max(0, ceil(Target Stock - Inventory Position))

        Parameters
        ----------
        current_stock       : int   – On-hand stock (Inventory.current_stock)
        average_daily_sales : float – Expected daily demand
        lead_time_days      : int   – Supplier lead time in days
        safety_stock        : int   – Safety stock from Inventory.safety_stock
        on_order_qty        : int   – Quantity on existing active orders
        backorders          : int   – Backorders (defaults to 0, not in schema)

        Returns
        -------
        int : Integer quantity to reorder (>= 0).
        """
        target_stock = ReorderCalculator.calculate_target_stock(
            average_daily_sales=average_daily_sales,
            lead_time_days=lead_time_days,
            safety_stock=safety_stock
        )
        inv_position = ReorderCalculator.calculate_inventory_position(
            current_stock=current_stock,
            on_order_qty=on_order_qty,
            backorders=backorders
        )
        net_needed = target_stock - inv_position
        return max(0, math.ceil(net_needed))

    @staticmethod
    def should_reorder(
        recommendation_score: float,
        current_stock: int,
        reorder_point: int | None,
        on_order_qty: int = 0,
        backorders: int = 0,
        reorder_quantity: int | None = None
    ) -> bool:
        """
        Determines whether a reorder is required using consistent inventory assumptions:
        1. Inventory Position (On-hand + On-order - Backorders) is at or below Reorder Point, OR
        2. AI recommendation score (0–100 scale) indicates high demand (>= 55.0).
        
        If reorder_quantity is provided, reorder is only required if reorder_quantity > 0
        (we never place an order for 0 units).
        """
        inv_position = ReorderCalculator.calculate_inventory_position(
            current_stock=current_stock,
            on_order_qty=on_order_qty,
            backorders=backorders
        )

        if reorder_point is not None:
            stock_breached = inv_position <= int(reorder_point)
        else:
            stock_breached = inv_position <= 0

        score_high = float(recommendation_score or 0.0) >= 55.0

        decision = stock_breached or score_high

        if reorder_quantity is not None:
            return decision and (int(reorder_quantity) > 0)
        return decision
