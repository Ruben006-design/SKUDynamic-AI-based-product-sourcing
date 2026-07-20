from datetime import date
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    Date,
    ForeignKey,
    Numeric,
    UniqueConstraint,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.database.base import Base


class ProductSupplier(Base):
    """
    Represents the relationship
    between a product and a supplier.
    """

    __tablename__ = "Product_Supplier"

    __table_args__ = (
        UniqueConstraint(
            "product_id",
            "supplier_id",
            name="uq_product_supplier",
        ),
    )

    product_supplier_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("Product.product_id"),
        nullable=False,
    )

    supplier_id: Mapped[int] = mapped_column(
        ForeignKey("Supplier.supplier_id"),
        nullable=False,
    )

    is_preferred: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    negotiated_price: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2)
    )

    contract_start: Mapped[date | None] = mapped_column(
        Date
    )

    contract_end: Mapped[date | None] = mapped_column(
        Date
    )

    product = relationship(
        "Product",
        back_populates="product_suppliers",
    )

    supplier = relationship(
        "Supplier",
        back_populates="product_suppliers",
    )