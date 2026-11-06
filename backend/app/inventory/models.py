from decimal import Decimal

from sqlalchemy import (
    Index,
    Integer,
    Numeric,
    ForeignKey,
    TIMESTAMP,
    UniqueConstraint,
    text
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship
)

from app.database.base import Base


class Inventory(Base):
    """
    Represents inventory details of a product
    belonging to a retailer.
    """

    __tablename__ = "Inventory"

    __table_args__ = (
        # Enforce one inventory record per product
        UniqueConstraint("product_id", name="uq_inventory_product_id"),
        Index("ix_inventory_product_id", "product_id"),
        Index("ix_inventory_retailer_id", "retailer_id"),
    )

    inventory_id: Mapped[int] = mapped_column(
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

    current_stock: Mapped[int] = mapped_column(
        Integer,
        default=0
    )

    reserved_stock: Mapped[int] = mapped_column(
        Integer,
        default=0
    )

    reorder_point: Mapped[int | None] = mapped_column(
        Integer
    )

    eoq: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2)
    )

    safety_stock: Mapped[int | None] = mapped_column(
        Integer
    )

    last_updated: Mapped[str] = mapped_column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP"),
        server_onupdate=text("CURRENT_TIMESTAMP")
    )

    product = relationship(
        "Product",
        back_populates="inventories"
    )

    retailer = relationship(
        "Retailer",
        back_populates="inventories"
    )
