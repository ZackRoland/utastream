"""Source-neutral catalog domain values."""

from dataclasses import dataclass, field
from datetime import datetime
from enum import StrEnum
from typing import Any
from uuid import UUID, uuid4


class PlaybackSourceKind(StrEnum):
    FIXTURE = "fixture"
    LOCAL_FILE = "local_file"
    YOUTUBE = "youtube"


class SourceAvailability(StrEnum):
    AVAILABLE = "available"
    UNAVAILABLE = "unavailable"
    LOCAL_FILE_REQUIRED = "local_file_required"


@dataclass(frozen=True, slots=True)
class Track:
    canonical_title: str
    artist_name: str
    duration_ms: int
    album_title: str | None = None
    id: UUID = field(default_factory=uuid4)
    created_at: datetime | None = None
    updated_at: datetime | None = None


@dataclass(frozen=True, slots=True)
class PlaybackSource:
    track_id: UUID
    kind: PlaybackSourceKind
    availability: SourceAvailability
    external_id: str | None = None
    source_uri: str | None = None
    original_metadata: dict[str, Any] = field(default_factory=dict)
    duration_ms: int | None = None
    capabilities: dict[str, Any] = field(default_factory=dict)
    provenance: dict[str, Any] = field(default_factory=dict)
    id: UUID = field(default_factory=uuid4)
    created_at: datetime | None = None
    updated_at: datetime | None = None


@dataclass(frozen=True, slots=True)
class LibraryItem:
    user_id: UUID
    track_id: UUID
    preferred_source_id: UUID | None = None
    id: UUID = field(default_factory=uuid4)
    created_at: datetime | None = None
    updated_at: datetime | None = None
