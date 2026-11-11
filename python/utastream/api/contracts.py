from typing import Literal

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class ApiModel(BaseModel):
    """Base model for the public JSON boundary."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        serialize_by_alias=True,
    )


class HealthResponse(ApiModel):
    status: Literal["ok"] = "ok"


class ReadinessResponse(ApiModel):
    status: Literal["ready"] = "ready"
    checks: dict[str, Literal["ok"]]


class ErrorDetail(ApiModel):
    code: str
    message: str
    request_id: str


class ErrorEnvelope(ApiModel):
    error: ErrorDetail
