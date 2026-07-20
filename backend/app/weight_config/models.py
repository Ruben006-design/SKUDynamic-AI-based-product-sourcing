from sqlalchemy import (
    Boolean,
    ForeignKey,
    Numeric,
    String
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class WeightConfig(Base):
    """
    Stores AI weight configuration for a retailer.
    """

    __tablename__ = "Weight_Config"

    config_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    retailer_id: Mapped[int] = mapped_column(
        ForeignKey("Retailer.retailer_id"),
        nullable=False
    )

    config_name: Mapped[str | None] = mapped_column(
        String(100)
    )

    sales_volume_w: Mapped[float] = mapped_column(
        Numeric(5, 2),
        default=0.20
    )

    lead_time_w: Mapped[float] = mapped_column(
        Numeric(5, 2),
        default=0.15
    )

    supplier_quality_w: Mapped[float] = mapped_column(
        Numeric(5, 2),
        default=0.15
    )

    popularity_w: Mapped[float] = mapped_column(
        Numeric(5, 2),
        default=0.15
    )

    weather_w: Mapped[float] = mapped_column(
        Numeric(5, 2),
        default=0.10
    )

    festival_demand_w: Mapped[float] = mapped_column(
        Numeric(5, 2),
        default=0.10
    )

    durability_w: Mapped[float] = mapped_column(
        Numeric(5, 2),
        default=0.10
    )

    expiry_w: Mapped[float] = mapped_column(
        Numeric(5, 2),
        default=0.05
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )

    retailer = relationship(
        "Retailer",
        back_populates="weight_configs"
    )
    weightages = relationship(
        "Weightage",
        back_populates="config"
    )