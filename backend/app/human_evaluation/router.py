from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends

from app.database.database import get_db

from app.human_evaluation.schemas import (
    HumanEvaluationCreate,
    HumanEvaluationUpdate,
    HumanEvaluationResponse
)

from app.human_evaluation.service import (
    HumanEvaluationService
)


router = APIRouter(
    prefix="/human-evaluations",
    tags=["Human Evaluation"]
)


@router.post(
    "",
    response_model=HumanEvaluationResponse,
    status_code=201
)
def create_evaluation(
    evaluation: HumanEvaluationCreate,
    db: Session = Depends(get_db)
):
    return HumanEvaluationService.create_evaluation(
        db,
        evaluation
    )


@router.get(
    "",
    response_model=list[HumanEvaluationResponse]
)
def get_all_evaluations(
    db: Session = Depends(get_db)
):
    return HumanEvaluationService.get_all_evaluations(
        db
    )


@router.get(
    "/{eval_id}",
    response_model=HumanEvaluationResponse
)
def get_evaluation(
    eval_id: int,
    db: Session = Depends(get_db)
):
    return HumanEvaluationService.get_evaluation_by_id(
        db,
        eval_id
    )


@router.put(
    "/{eval_id}",
    response_model=HumanEvaluationResponse
)
def update_evaluation(
    eval_id: int,
    evaluation: HumanEvaluationUpdate,
    db: Session = Depends(get_db)
):
    return HumanEvaluationService.update_evaluation(
        db,
        eval_id,
        evaluation
    )


@router.delete(
    "/{eval_id}"
)
def delete_evaluation(
    eval_id: int,
    db: Session = Depends(get_db)
):
    return HumanEvaluationService.delete_evaluation(
        db,
        eval_id
    )