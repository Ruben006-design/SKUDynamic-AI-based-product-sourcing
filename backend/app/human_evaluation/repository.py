from sqlalchemy.orm import Session

from app.human_evaluation.models import HumanEvaluation
from app.human_evaluation.schemas import (
    HumanEvaluationCreate,
    HumanEvaluationUpdate
)


class HumanEvaluationRepository:
    """
    Handles database operations for Human Evaluation.
    """

    @staticmethod
    def create(
        db: Session,
        evaluation: HumanEvaluationCreate
    ):
        db_evaluation = HumanEvaluation(
            **evaluation.model_dump()
        )

        db.add(db_evaluation)
        db.commit()
        db.refresh(db_evaluation)

        return db_evaluation

    @staticmethod
    def get_all(
        db: Session
    ):
        return db.query(
            HumanEvaluation
        ).all()

    @staticmethod
    def get_by_id(
        db: Session,
        eval_id: int
    ):
        return (
            db.query(HumanEvaluation)
            .filter(
                HumanEvaluation.eval_id == eval_id
            )
            .first()
        )

    @staticmethod
    def update(
        db: Session,
        evaluation: HumanEvaluation,
        evaluation_data: HumanEvaluationUpdate
    ):
        update_data = evaluation_data.model_dump(
            exclude_unset=True
        )

        for key, value in update_data.items():
            setattr(
                evaluation,
                key,
                value
            )

        db.commit()
        db.refresh(evaluation)

        return evaluation

    @staticmethod
    def delete(
        db: Session,
        evaluation: HumanEvaluation
    ):
        db.delete(evaluation)
        db.commit()

        return {
            "message": (
                "Human evaluation deleted successfully."
            )
        }