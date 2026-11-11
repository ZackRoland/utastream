"""Versioned lyric and playback-binding domain values."""

from dataclasses import dataclass, field
from datetime import datetime
from enum import StrEnum
from typing import Any
from uuid import UUID, uuid4


class TimingType(StrEnum):
    LINE = "line"
    WORD = "word"


@dataclass(frozen=True, slots=True)
class LyricDocument:
    track_id: UUID
    language: str
    version: int
    timing_type: TimingType
    source_provider: str
    segments: list[dict[str, Any]]
    source_record_id: str | None = None
    attribution: str | None = None
    rights_capabilities: dict[str, Any] = field(default_factory=dict)
    id: UUID = field(default_factory=uuid4)
    created_at: datetime | None = None
    updated_at: datetime | None = None


@dataclass(frozen=True, slots=True)
class PlaybackLyricBinding:
    track_id: UUID
    playback_source_id: UUID
    lyric_document_id: UUID
    match_confidence: int
    matching_policy_version: str
    confirmed_by_user: bool = False
    confirmed_at: datetime | None = None
    timing_offset_ms: int = 0
    duration_difference_ms: int | None = None
    id: UUID = field(default_factory=uuid4)
    created_at: datetime | None = None
