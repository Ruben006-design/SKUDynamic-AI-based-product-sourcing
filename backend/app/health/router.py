from fastapi import APIRouter

router = APIRouter(
    prefix="/health",
    tags=["Health"]
)


@router.get("")
def health_check():
    """
    Health check endpoint.
    """

    return {
        "status": "UP",
        "service": "Data Ingestion Service",
        "message": "Service is running successfully."
    }