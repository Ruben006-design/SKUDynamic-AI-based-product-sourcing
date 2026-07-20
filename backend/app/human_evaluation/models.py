from sqlalchemy import (
    ForeignKey,
    Numeric,
    String,
    Text,
    TIMESTAMP,
    text
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class HumanEvaluation(Base):
    """
    Stores manual changes made by users
    to AI-generated weightages.
    """

    __tablename__ = "Human_Eval_Log"

    eval_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    weightage_id: Mapped[int] = mapped_column(
        ForeignKey("Weightage.weightage_id"),
        nullable=False
    )

    retailer_id: Mapped[int] = mapped_column(
        ForeignKey("Retailer.retailer_id"),
        nullable=False
    )

    field_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    old_value: Mapped[float | None] = mapped_column(
        Numeric(5, 2)
    )

    new_value: Mapped[float | None] = mapped_column(
        Numeric(5, 2)
    )

    override_reason: Mapped[str | None] = mapped_column(
        Text
    )

    evaluated_by: Mapped[str | None] = mapped_column(
        String(255)
    )

    evaluated_at: Mapped[str] = mapped_column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    weightage = relationship(
        "Weightage",
        back_populates="human_evaluations"
    )

    retailer = relationship(
        "Retailer",
        back_populates="human_evaluations"
    )