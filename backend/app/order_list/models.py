from datetime import datetime

from sqlalchemy import (
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    TIMESTAMP,
    text
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship
)

from app.database.base import Base


class OrderList(Base):
    """
    Stores AI-generated product reorder recommendations.
    """

    __tablename__ = "Order_List"

    order_list_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("Product.product_id"),
        nullable=False
    )

    weightage_id: Mapped[int] = mapped_column(
        ForeignKey("Weightage.weightage_id"),
        nullable=False
    )

    retailer_id: Mapped[int] = mapped_column(
        ForeignKey("Retailer.retailer_id"),
        nullable=False
    )

    preferred_supplier_id: Mapped[int | None] = mapped_column(
        ForeignKey("Supplier.supplier_id")
    )

    recommended_order_qty: Mapped[int | None] = mapped_column(
        Integer
    )

    final_score: Mapped[float | None] = mapped_column(
        Numeric(8, 4)
    )

    justification_summary: Mapped[str | None] = mapped_column(
        Text
    )

    status: Mapped[str] = mapped_column(
        Enum(
            "pending",
            "approved",
            "rejected",
            "ordered",
            name="order_status"
        ),
        default="pending"
    )

    approved_by: Mapped[str | None] = mapped_column(
        String(255)
    )

    approved_at: Mapped[datetime | None] = mapped_column(
        TIMESTAMP
    )

    generated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )


    product = relationship(
        "Product",
        back_populates="order_lists"
    )

    retailer = relationship(
        "Retailer",
        back_populates="order_lists"
    )

    weightage = relationship(
        "Weightage",
        back_populates="order_lists"
    )

    preferred_supplier = relationship(
        "Supplier",
        back_populates="order_lists"
    )