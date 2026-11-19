from datetime import datetime
from typing import Any, Literal
from uuid import UUID

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


class YouTubeMetadataResponse(ApiModel):
    status: Literal["ready", "unavailable"]
    title: str | None = None
    artist: str | None = None
    provider_title: str | None = None
    provider_author: str | None = None


class ImportSourceInput(ApiModel):
    kind: Literal["local_file", "youtube"]
    availability: Literal["available", "local_file_required"]
    external_id: str | None
    normalized_url: str | None
    duration_seconds: float
    original_metadata: dict[str, Any]
    capabilities: dict[str, Any]
    provenance: dict[str, Any]


class ConfirmedLyricInput(ApiModel):
    provider_record_id: str
    lyric_document_version: int
    normalized_segments: list[dict[str, Any]]
    attribution: str
    rights_capabilities: dict[str, Any]
    score: int
    matching_policy_version: str
    confirmed_at: datetime
    timing_offset_ms: int
    duration_difference_seconds: float | None


class CompleteTrackImportRequest(ApiModel):
    user_id: UUID
    title: str
    artist: str
    album: str | None = None
    source: ImportSourceInput
    lyrics: ConfirmedLyricInput


class LibraryPlaybackSource(ApiModel):
    id: UUID
    kind: Literal["local_file", "youtube", "fixture"]
    availability: Literal["available", "unavailable", "local_file_required"]
    external_id: str | None
    normalized_url: str | None
    duration_seconds: float | None
    capabilities: dict[str, Any]


class LibraryLyricDocument(ApiModel):
    id: UUID
    version: int
    language: str
    timing_type: Literal["line", "word"]
    segments: list[dict[str, Any]]
    source_provider: str
    source_record_id: str | None
    attribution: str | None
    rights_capabilities: dict[str, Any]


class LibraryTrack(ApiModel):
    library_item_id: UUID
    track_id: UUID
    title: str
    artist: str
    album: str | None
    duration_seconds: float
    preferred_source_id: UUID | None
    sources: list[LibraryPlaybackSource]
    lyrics: LibraryLyricDocument | None


class CompleteTrackImportResponse(ApiModel):
    item: LibraryTrack
    track_created: bool
    source_created: bool
    library_item_created: bool


class LibraryResponse(ApiModel):
    items: list[LibraryTrack]


class SaveLearningItemRequest(ApiModel):
    user_id: UUID
    track_id: UUID
    lyric_document_id: UUID
    segment_key: str
    selected_text: str
    selection_kind: Literal["expression", "kanji"]


class LearningItemResponse(ApiModel):
    id: UUID
    user_id: UUID
    track_id: UUID
    lyric_document_id: UUID
    segment_key: str
    selected_text: str
    selection_kind: Literal["expression", "kanji"]
    created_at: datetime


class LearningCollectionResponse(ApiModel):
    items: list[LearningItemResponse]
