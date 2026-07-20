from datetime import date

from sqlalchemy import (
    Date,
    ForeignKey,
    Numeric,
    String,
    TIMESTAMP,
    text
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Product(Base):
    """
    Represents a product sold by a retailer.
    """

    __tablename__ = "Product"

    product_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    retailer_id: Mapped[int] = mapped_column(
        ForeignKey("Retailer.retailer_id"),
        nullable=False
    )

    product_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    category: Mapped[str | None] = mapped_column(
        String(100)
    )

    sku_code: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False
    )

    durability_days: Mapped[int | None] = mapped_column()

    expiry_date: Mapped[date | None] = mapped_column(
        Date
    )

    unit_cost: Mapped[float | None] = mapped_column(
        Numeric(10, 2)
    )

    created_at: Mapped[str] = mapped_column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )
    retailer = relationship(
        "Retailer",
        back_populates="products"
    )   
    product_suppliers = relationship(
        "ProductSupplier",
        back_populates="product",
        cascade="all, delete-orphan",
    )
    inventories = relationship(
        "Inventory",
        back_populates="product",
        cascade="all, delete-orphan"
    )
    sales = relationship(
        "Sales",
        back_populates="product",
        cascade="all, delete-orphan"
    )
    weightages = relationship(
        "Weightage",
        back_populates="product"
    )
    order_lists = relationship(
        "OrderList",
        back_populates="product"
    )