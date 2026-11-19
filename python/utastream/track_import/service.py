"""Atomic completion of the source-neutral track-import pipeline."""

from dataclasses import dataclass
from datetime import datetime
from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from utastream.catalog import (
    LibraryItem,
    PlaybackSource,
    PlaybackSourceKind,
    SourceAvailability,
    Track,
)
from utastream.database.repositories.catalog import CatalogRepository
from utastream.database.repositories.lyrics import LyricsRepository
from utastream.lyrics import LyricDocument, PlaybackLyricBinding, TimingType


@dataclass(frozen=True, slots=True)
class ImportCommand:
    user_id: UUID
    title: str
    artist: str
    album: str | None
    duration_ms: int
    source_kind: PlaybackSourceKind
    source_availability: SourceAvailability
    source_external_id: str | None
    source_uri: str | None
    source_original_metadata: dict[str, Any]
    source_capabilities: dict[str, Any]
    source_provenance: dict[str, Any]
    lyric_provider_record_id: str
    lyric_version: int
    lyric_segments: list[dict[str, Any]]
    lyric_attribution: str
    lyric_rights_capabilities: dict[str, Any]
    match_confidence: int
    matching_policy_version: str
    confirmed_at: datetime
    timing_offset_ms: int
    duration_difference_ms: int | None


@dataclass(frozen=True, slots=True)
class ImportResult:
    track: Track
    source: PlaybackSource
    library_item: LibraryItem
    lyric_document: LyricDocument
    binding: PlaybackLyricBinding
    track_created: bool
    source_created: bool
    library_item_created: bool


def complete_import(session: Session, command: ImportCommand) -> ImportResult:
    catalog = CatalogRepository(session)
    lyrics = LyricsRepository(session)
    track = catalog.find_matching_track(
        canonical_title=command.title,
        artist_name=command.artist,
        duration_ms=command.duration_ms,
    )
    track_created = track is None
    if track is None:
        track = catalog.add_track(
            Track(
                canonical_title=command.title,
                artist_name=command.artist,
                album_title=command.album,
                duration_ms=command.duration_ms,
            )
        )

    source = catalog.find_playback_source(
        track_id=track.id,
        kind=command.source_kind,
        external_id=command.source_external_id,
        filename=_filename(command.source_original_metadata),
    )
    source_created = source is None
    if source is None:
        source = catalog.add_playback_source(
            PlaybackSource(
                track_id=track.id,
                kind=command.source_kind,
                availability=command.source_availability,
                external_id=command.source_external_id,
                source_uri=command.source_uri,
                original_metadata=command.source_original_metadata,
                duration_ms=command.duration_ms,
                capabilities=command.source_capabilities,
                provenance=command.source_provenance,
            )
        )

    document = lyrics.find_document(
        track_id=track.id,
        source_provider="lrclib",
        source_record_id=command.lyric_provider_record_id,
    )
    if document is None:
        document = lyrics.add_document(
            LyricDocument(
                track_id=track.id,
                language="ja",
                version=command.lyric_version,
                timing_type=TimingType.LINE,
                source_provider="lrclib",
                source_record_id=command.lyric_provider_record_id,
                attribution=command.lyric_attribution,
                rights_capabilities=command.lyric_rights_capabilities,
                segments=command.lyric_segments,
            )
        )

    binding = lyrics.find_binding(
        playback_source_id=source.id,
        lyric_document_id=document.id,
    )
    if binding is None:
        binding = lyrics.add_binding(
            PlaybackLyricBinding(
                track_id=track.id,
                playback_source_id=source.id,
                lyric_document_id=document.id,
                match_confidence=command.match_confidence,
                matching_policy_version=command.matching_policy_version,
                confirmed_by_user=True,
                confirmed_at=command.confirmed_at,
                timing_offset_ms=command.timing_offset_ms,
                duration_difference_ms=command.duration_difference_ms,
            )
        )

    item = catalog.get_library_item(command.user_id, track.id)
    library_item_created = item is None
    if item is None:
        item = catalog.add_library_item(
            LibraryItem(
                user_id=command.user_id,
                track_id=track.id,
                preferred_source_id=source.id,
            )
        )
    elif item.preferred_source_id != source.id:
        item = catalog.set_preferred_source(
            user_id=command.user_id,
            track_id=track.id,
            preferred_source_id=source.id,
        )

    return ImportResult(
        track=track,
        source=source,
        library_item=item,
        lyric_document=document,
        binding=binding,
        track_created=track_created,
        source_created=source_created,
        library_item_created=library_item_created,
    )


def _filename(metadata: dict[str, Any]) -> str | None:
    value = metadata.get("filename")
    return value if isinstance(value, str) else None
