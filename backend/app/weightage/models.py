
from sqlalchemy import (
    ForeignKey,
    Numeric,
    String,
    TIMESTAMP,
    text
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship
)

from app.database.base import Base


class Weightage(Base):
    """
    Stores the historical AI-generated weight snapshot
    for a product recommendation.
    """

    __tablename__ = "Weightage"

    weightage_id: Mapped[int] = mapped_column(
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

    config_id: Mapped[int | None] = mapped_column(
        ForeignKey("Weight_Config.config_id")
    )

    sales_volume_weight: Mapped[float] = mapped_column(
        Numeric(5, 2)
    )

    lead_time_weight: Mapped[float] = mapped_column(
        Numeric(5, 2)
    )

    supplier_quality_weight: Mapped[float] = mapped_column(
        Numeric(5, 2)
    )

    popularity_weight: Mapped[float] = mapped_column(
        Numeric(5, 2)
    )

    weather_weight: Mapped[float] = mapped_column(
        Numeric(5, 2)
    )

    festival_demand_weight: Mapped[float] = mapped_column(
        Numeric(5, 2)
    )

    durability_weight: Mapped[float] = mapped_column(
        Numeric(5, 2)
    )

    expiry_weight: Mapped[float] = mapped_column(
        Numeric(5, 2)
    )

    recommendation_score: Mapped[float | None] = mapped_column(
        Numeric(6, 2)
    )

    llm_model_used: Mapped[str | None] = mapped_column(
        String(100)
    )

    generated_at: Mapped[str] = mapped_column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    product = relationship(
        "Product",
        back_populates="weightages"
    )

    retailer = relationship(
        "Retailer",
        back_populates="weightages"
    )

    config = relationship(
        "WeightConfig",
        back_populates="weightages"
    )
    human_evaluations = relationship(
        "HumanEvaluation",
        back_populates="weightage",
        cascade="all, delete-orphan"
    )
    order_lists = relationship(
        "OrderList",
        back_populates="weightage"
    )