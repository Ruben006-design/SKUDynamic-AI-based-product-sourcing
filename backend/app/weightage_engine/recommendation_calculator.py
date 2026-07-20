class RecommendationCalculator:
    """
    Calculates recommendation score for a product
    based on AI-generated weights and business data.
    """

    @staticmethod
    def calculate(
        product,
        inventory,
        sales,
        suppliers,
        weights
    ):
        """
        Returns a recommendation score.
        """

        total_sales = float(sum(
            sale.quantity_sold or 0
            for sale in sales
        ))


        stock = 0

        if inventory:
            stock = float(inventory.current_stock or 0)

        # Lower stock → higher urgency
        inventory_score = max(
            0,
            100 - stock
        )
        lead_time = 0.0
        quality = 0.0

        if suppliers:

            supplier = suppliers[0].supplier

            if supplier:
                lead_time = float(supplier.lead_time_days or 0)
                quality = float(supplier.quality_score or 0)

        durability = float(product.durability_days or 0)

        expiry_score = 0.0

        if product.expiry_date:
            expiry_score = 50.0

        score = (
            float(total_sales) * float(weights["sales_volume_weight"])
            + float(lead_time) * float(weights["lead_time_weight"])
            + float(quality) * float(weights["supplier_quality_weight"])
            + float(inventory_score) * float(weights["popularity_weight"])
            + float(durability) * float(weights["durability_weight"])
            + float(expiry_score) * float(weights["expiry_weight"])
        )
        return round(score, 2)