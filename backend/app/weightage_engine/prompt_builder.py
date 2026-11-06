class PromptBuilder:
    """
    Builds a structured prompt for the AI model.
    """

    @staticmethod
    def build_prompt(
        retailer,
        config,
        product,
        inventory,
        sales,
        suppliers,
        human_evaluations
    ):

        prompt = []

        prompt.append(
            "You are an AI inventory optimization assistant."
        )

        prompt.append(
            "Generate optimal business weights for product reordering."
        )

        prompt.append(
            "The total of all weights MUST equal exactly 1.00."
        )

        prompt.append("")

        if retailer is not None:
            prompt.append("=== RETAILER ===")
            prompt.append(
                f"Retailer ID: {retailer.retailer_id}"
            )
            prompt.append("")

        prompt.append(
            "=== WEIGHT CONFIGURATION ==="
        )

        prompt.append(
            f"Configuration ID: {config.config_id}"
        )

        prompt.append("")

        prompt.append("=== PRODUCT ===")

        prompt.append(
            f"""
        Product ID: {product.product_id}
        Name: {product.product_name}
        Category: {product.category}
        SKU: {product.sku_code}
        Durability Days: {product.durability_days}
        Expiry Date: {product.expiry_date}
        Unit Cost: {product.unit_cost}
        """
        )

        prompt.append("")

        prompt.append("=== INVENTORY ===")

        if inventory:

            prompt.append(
                f"""
Current Stock: {inventory.current_stock}
Reserved Stock: {inventory.reserved_stock}
Safety Stock: {inventory.safety_stock}
Reorder Point: {inventory.reorder_point}
EOQ: {inventory.eoq}
"""
            )

        else:

            prompt.append(
                "No inventory available."
            )

        prompt.append("")

        prompt.append("=== SALES ===")

        if sales:

            for sale in sales:

                prompt.append(
                    f"""
Sale Date: {sale.sale_date}
Quantity Sold: {sale.quantity_sold}
Revenue: {sale.revenue}
Popularity Score: {sale.popularity_score}
Sales Channel: {sale.sales_channel}
"""
                )

        else:

            prompt.append(
                "No sales history available."
            )

        prompt.append("")

        prompt.append("=== SUPPLIERS ===")

        if suppliers:

            for ps in suppliers:
                s = getattr(ps, "supplier", None)
                if s:
                    prompt.append(
                        f"Supplier: {s.supplier_name} "
                        f"| Quality: {s.quality_score} "
                        f"| Lead Time: {s.lead_time_days} days "
                        f"| Negotiated Price: {getattr(ps, 'negotiated_price', 'N/A')} "
                        f"| Preferred: {getattr(ps, 'is_preferred', False)}"
                    )

        else:

            prompt.append(
                "No supplier information available."
            )

        prompt.append("")

        prompt.append(
            "=== HUMAN EVALUATIONS ==="
        )

        if human_evaluations:

            for e in human_evaluations:
                prompt.append(
                    f"Evaluation ID: {getattr(e, 'eval_id', 'N/A')} "
                    f"| Field: {getattr(e, 'field_name', 'N/A')} "
                    f"| Old: {getattr(e, 'old_value', 'N/A')} "
                    f"-> New: {getattr(e, 'new_value', 'N/A')} "
                    f"| Reason: {getattr(e, 'override_reason', 'N/A')} "
                    f"| By: {getattr(e, 'evaluated_by', 'N/A')}"
                )

        else:

            prompt.append(
                "No previous human evaluations available."
            )

        prompt.append("")

        prompt.append("=== TASK ===")

        prompt.append(
            """
Generate ONLY the following JSON:

{
  "sales_volume_weight": ...,
  "lead_time_weight": ...,
  "supplier_quality_weight": ...,
  "popularity_weight": ...,
  "weather_weight": ...,
  "festival_demand_weight": ...,
  "durability_weight": ...,
  "expiry_weight": ...
}

Rules:

1. Every value must be between 0 and 1.
2. Total must equal exactly 1.00.
3. Return JSON only.
"""
        )

        return "\n".join(prompt)
