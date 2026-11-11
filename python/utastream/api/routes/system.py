from fastapi import APIRouter

from ..contracts import HealthResponse, ReadinessResponse
from ..errors import error_responses

router = APIRouter(tags=["system"])


@router.get(
    "/health",
    operation_id="getHealth",
    response_model=HealthResponse,
    responses=error_responses(500),
)
def get_health() -> HealthResponse:
    return HealthResponse()


@router.get(
    "/ready",
    operation_id="getReadiness",
    response_model=ReadinessResponse,
    responses=error_responses(503, 500),
)
def get_readiness() -> ReadinessResponse:
    return ReadinessResponse(checks={"application": "ok"})
