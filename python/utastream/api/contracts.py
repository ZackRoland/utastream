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


class LyricCandidate(ApiModel):
    provider_record_id: str
    title: str
    artist: str
    album: str | None
    duration_seconds: float
    duration_difference_seconds: float | None
    instrumental: bool
    plain_lyrics: str | None
    synced_lyrics: str | None
    lyric_document_version: int = 1
    timing_type: Literal["line"] | None
    normalized_segments: list[dict[str, object]]
    rights_capabilities: dict[str, bool | str]
    score: int
    confidence_band: Literal["strong", "ambiguous", "weak"]
    warnings: list[str]
    matching_policy_version: str
    source_provider: Literal["lrclib"] = "lrclib"
    attribution: str = "Lyrics supplied by LRCLIB"


class LyricCandidateResponse(ApiModel):
    status: Literal[
        "ready", "missing", "rate_limited", "timeout", "overloaded", "unavailable"
    ]
    candidates: list[LyricCandidate]
    retry_after_seconds: int | None = None
