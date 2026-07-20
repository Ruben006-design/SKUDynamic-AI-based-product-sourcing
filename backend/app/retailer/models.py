from sqlalchemy import String, Enum, TIMESTAMP, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Retailer(Base):
    """
    Represents a retailer using the system.
    """

    __tablename__ = "Retailer"

    retailer_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    retailer_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    industry_type: Mapped[str | None] = mapped_column(
        String(100)
    )

    contact_email: Mapped[str | None] = mapped_column(
        String(255)
    )

    plan_tier: Mapped[str] = mapped_column(
        Enum("starter", "growth", "enterprise"),
        default="starter"
    )

    created_at: Mapped[str] = mapped_column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    # One retailer can have many products
    products = relationship(
        "Product",
        back_populates="retailer",
        cascade="all, delete-orphan"
    )
    suppliers = relationship(
        "Supplier",
        back_populates="retailer",
        cascade="all, delete-orphan"
    )
    inventories = relationship(
        "Inventory",
        back_populates="retailer",
        cascade="all, delete-orphan"
    )
    sales = relationship(
        "Sales",
        back_populates="retailer",
        cascade="all, delete-orphan"
    )
    weight_configs = relationship(
        "WeightConfig",
        back_populates="retailer",
        cascade="all, delete-orphan"
    )
    weightages = relationship(
        "Weightage",
        back_populates="retailer"
    )
    human_evaluations = relationship(
        "HumanEvaluation",
        back_populates="retailer",
        cascade="all, delete-orphan"
    )
    order_lists = relationship(
        "OrderList",
        back_populates="retailer"
    )