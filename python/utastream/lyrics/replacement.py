"""Atomic replacement of a playback source's active lyric binding."""

from dataclasses import dataclass
from datetime import datetime
from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from utastream.database.repositories.catalog import CatalogRepository
from utastream.database.repositories.lyrics import LyricsRepository
from utastream.lyrics.model import LyricDocument, PlaybackLyricBinding, TimingType


class LibraryTrackNotFoundError(ValueError):
    """Raised when the user does not own the requested library track."""


class PlaybackSourceNotFoundError(ValueError):
    """Raised when the source does not belong to the requested track."""


@dataclass(frozen=True, slots=True)
class ReplaceLyricsCommand:
    user_id: UUID
    track_id: UUID
    playback_source_id: UUID
    provider_record_id: str
    segments: list[dict[str, Any]]
    attribution: str
    rights_capabilities: dict[str, Any]
    match_confidence: int
    matching_policy_version: str
    confirmed_at: datetime
    timing_offset_ms: int
    duration_difference_ms: int | None


def replace_active_lyrics(
    session: Session,
    command: ReplaceLyricsCommand,
) -> PlaybackLyricBinding:
    catalog = CatalogRepository(session)
    lyrics = LyricsRepository(session)
    item = catalog.get_library_item(command.user_id, command.track_id)
    if item is None:
        raise LibraryTrackNotFoundError
    source = catalog.get_playback_source(command.playback_source_id)
    if source is None or source.track_id != command.track_id:
        raise PlaybackSourceNotFoundError

    document = lyrics.find_document(
        track_id=command.track_id,
        source_provider="lrclib",
        source_record_id=command.provider_record_id,
    )
    if document is None:
        document = lyrics.add_document(
            LyricDocument(
                track_id=command.track_id,
                language="ja",
                version=lyrics.next_document_version(
                    track_id=command.track_id,
                    language="ja",
                ),
                timing_type=TimingType.LINE,
                source_provider="lrclib",
                source_record_id=command.provider_record_id,
                attribution=command.attribution,
                rights_capabilities=command.rights_capabilities,
                segments=command.segments,
            )
        )

    binding = lyrics.find_binding(
        playback_source_id=source.id,
        lyric_document_id=document.id,
    )
    if binding is None:
        binding = lyrics.add_binding(
            PlaybackLyricBinding(
                track_id=command.track_id,
                playback_source_id=source.id,
                lyric_document_id=document.id,
                match_confidence=command.match_confidence,
                matching_policy_version=command.matching_policy_version,
                confirmed_by_user=True,
                confirmed_at=command.confirmed_at,
                timing_offset_ms=command.timing_offset_ms,
                duration_difference_ms=command.duration_difference_ms,
                is_active=lyrics.get_active_binding(source.id) is None,
            )
        )
    else:
        binding = lyrics.update_binding_confirmation(
            binding.id,
            match_confidence=command.match_confidence,
            matching_policy_version=command.matching_policy_version,
            confirmed_at=command.confirmed_at,
            timing_offset_ms=command.timing_offset_ms,
            duration_difference_ms=command.duration_difference_ms,
        )
        if binding is None:  # pragma: no cover - protected by the lookup above
            raise RuntimeError("lyric binding disappeared during replacement")

    activated = lyrics.activate_binding(binding.id)
    if activated is None:  # pragma: no cover - protected by the insert above
        raise RuntimeError("lyric binding disappeared during activation")
    return activated
