"""SQLAlchemy repository for versioned lyrics and source bindings."""

from sqlalchemy.orm import Session

from utastream.database.models import LyricDocumentRow, PlaybackLyricBindingRow
from utastream.lyrics import LyricDocument, PlaybackLyricBinding


class LyricsRepository:
    """Persist lyric documents without owning transaction boundaries."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def add_document(self, document: LyricDocument) -> LyricDocument:
        self._session.add(
            LyricDocumentRow(
                id=document.id,
                track_id=document.track_id,
                language=document.language,
                version=document.version,
                timing_type=document.timing_type.value,
                segments=document.segments,
                source_provider=document.source_provider,
                source_record_id=document.source_record_id,
                attribution=document.attribution,
                rights_capabilities=document.rights_capabilities,
            )
        )
        self._session.flush()
        return document

    def add_binding(self, binding: PlaybackLyricBinding) -> PlaybackLyricBinding:
        self._session.add(
            PlaybackLyricBindingRow(
                id=binding.id,
                track_id=binding.track_id,
                playback_source_id=binding.playback_source_id,
                lyric_document_id=binding.lyric_document_id,
                match_confidence=binding.match_confidence,
                matching_policy_version=binding.matching_policy_version,
                confirmed_by_user=binding.confirmed_by_user,
                confirmed_at=binding.confirmed_at,
                timing_offset_ms=binding.timing_offset_ms,
                duration_difference_ms=binding.duration_difference_ms,
            )
        )
        self._session.flush()
        return binding
