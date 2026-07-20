from decimal import Decimal

from sqlalchemy import (
    String,
    Numeric,
    ForeignKey,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.database.base import Base


class Supplier(Base):
    """
    Represents a supplier for a retailer.
    """

    __tablename__ = "Supplier"

    supplier_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    retailer_id: Mapped[int] = mapped_column(
        ForeignKey("Retailer.retailer_id"),
        nullable=False,
    )

    supplier_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    contact_person: Mapped[str | None] = mapped_column(
        String(255)
    )

    email: Mapped[str | None] = mapped_column(
        String(255)
    )

    phone: Mapped[str | None] = mapped_column(
        String(50)
    )

    lead_time_days: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 1)
    )

    quality_score: Mapped[Decimal | None] = mapped_column(
        Numeric(3, 2)
    )

    retailer = relationship(
        "Retailer",
        back_populates="suppliers"
    )
    product_suppliers = relationship(
        "ProductSupplier",
        back_populates="supplier",
        cascade="all, delete-orphan",
    )
    order_lists = relationship(
        "OrderList",
        back_populates="preferred_supplier"
    )
    