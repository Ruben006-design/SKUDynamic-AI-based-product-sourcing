import logging

from sqlalchemy.orm import Session

from app.exceptions.custom_exceptions import (
    HumanEvaluationNotFoundException
)
from app.human_evaluation.repository import (
    HumanEvaluationRepository
)
from app.human_evaluation.schemas import (
    HumanEvaluationCreate,
    HumanEvaluationUpdate
)

logger = logging.getLogger(__name__)


class HumanEvaluationService:
    """
    Contains business logic for Human Evaluation.
    """

    @staticmethod
    def create_evaluation(
        db: Session,
        evaluation: HumanEvaluationCreate
    ):
        logger.info("Creating human evaluation.")

        return HumanEvaluationRepository.create(
            db,
            evaluation
        )

    @staticmethod
    def get_all_evaluations(
        db: Session
    ):
        return HumanEvaluationRepository.get_all(db)

    @staticmethod
    def get_evaluation_by_id(
        db: Session,
        eval_id: int
    ):
        evaluation = HumanEvaluationRepository.get_by_id(
            db,
            eval_id
        )

        if evaluation is None:
            logger.warning(
                f"Human evaluation {eval_id} not found."
            )
            raise HumanEvaluationNotFoundException(
                eval_id
            )

        return evaluation

    @staticmethod
    def update_evaluation(
        db: Session,
        eval_id: int,
        evaluation_data: HumanEvaluationUpdate
    ):
        logger.info(
            f"Updating human evaluation {eval_id}"
        )

        evaluation = HumanEvaluationRepository.get_by_id(
            db,
            eval_id
        )

        if evaluation is None:
            logger.warning(
                f"Human evaluation {eval_id} not found."
            )
            raise HumanEvaluationNotFoundException(
                eval_id
            )

        return HumanEvaluationRepository.update(
            db,
            evaluation,
            evaluation_data
        )

    @staticmethod
    def delete_evaluation(
        db: Session,
        eval_id: int
    ):
        logger.info(
            f"Deleting human evaluation {eval_id}"
        )

        evaluation = HumanEvaluationRepository.get_by_id(
            db,
            eval_id
        )

        if evaluation is None:
            logger.warning(
                f"Human evaluation {eval_id} not found."
            )
            raise HumanEvaluationNotFoundException(
                eval_id
            )

        return HumanEvaluationRepository.delete(
            db,
            evaluation
        )