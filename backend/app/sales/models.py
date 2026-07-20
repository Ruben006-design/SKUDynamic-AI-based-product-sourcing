from datetime import date

from sqlalchemy import (
    Date,
    ForeignKey,
    Integer,
    Numeric,
    String
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Sales(Base):
    """
    Represents a sales transaction.
    """

    __tablename__ = "Sales"

    sale_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("Product.product_id"),
        nullable=False
    )

    retailer_id: Mapped[int] = mapped_column(
        ForeignKey("Retailer.retailer_id"),
        nullable=False
    )

    sale_date: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    quantity_sold: Mapped[int | None] = mapped_column(
        Integer
    )

    revenue: Mapped[float | None] = mapped_column(
        Numeric(12, 2)
    )

    popularity_score: Mapped[int | None] = mapped_column(
        Integer
    )

    sales_channel: Mapped[str | None] = mapped_column(
        String(100)
    )

    product = relationship(
        "Product",
        back_populates="sales"
    )

    retailer = relationship(
        "Retailer",
        back_populates="sales"
    )