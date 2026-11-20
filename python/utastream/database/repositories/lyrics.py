"""SQLAlchemy repository for versioned lyrics and source bindings."""

from datetime import datetime
from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from utastream.database.models import LyricDocumentRow, PlaybackLyricBindingRow
from utastream.lyrics import LyricDocument, PlaybackLyricBinding, TimingType


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
                is_active=binding.is_active,
            )
        )
        self._session.flush()
        return binding

    def find_document(
        self, *, track_id: UUID, source_provider: str, source_record_id: str
    ) -> LyricDocument | None:
        row = self._session.scalar(
            select(LyricDocumentRow).where(
                LyricDocumentRow.track_id == track_id,
                LyricDocumentRow.source_provider == source_provider,
                LyricDocumentRow.source_record_id == source_record_id,
            )
        )
        if row is None:
            return None
        return self._to_document(row)

    def get_document(self, document_id: UUID) -> LyricDocument | None:
        row = self._session.get(LyricDocumentRow, document_id)
        return self._to_document(row) if row is not None else None

    def list_documents(self, track_id: UUID) -> list[LyricDocument]:
        rows = self._session.scalars(
            select(LyricDocumentRow)
            .where(LyricDocumentRow.track_id == track_id)
            .order_by(LyricDocumentRow.version, LyricDocumentRow.id)
        )
        return [self._to_document(row) for row in rows]

    def next_document_version(self, *, track_id: UUID, language: str) -> int:
        latest = self._session.scalar(
            select(func.max(LyricDocumentRow.version)).where(
                LyricDocumentRow.track_id == track_id,
                LyricDocumentRow.language == language,
            )
        )
        return int(latest or 0) + 1

    def find_binding(
        self, *, playback_source_id: UUID, lyric_document_id: UUID
    ) -> PlaybackLyricBinding | None:
        row = self._session.scalar(
            select(PlaybackLyricBindingRow).where(
                PlaybackLyricBindingRow.playback_source_id == playback_source_id,
                PlaybackLyricBindingRow.lyric_document_id == lyric_document_id,
            )
        )
        if row is None:
            return None
        return self._to_binding(row)

    def get_active_binding(
        self, playback_source_id: UUID
    ) -> PlaybackLyricBinding | None:
        row = self._session.scalar(
            select(PlaybackLyricBindingRow).where(
                PlaybackLyricBindingRow.playback_source_id == playback_source_id,
                PlaybackLyricBindingRow.is_active.is_(True),
            )
        )
        return self._to_binding(row) if row is not None else None

    def activate_binding(self, binding_id: UUID) -> PlaybackLyricBinding | None:
        row = self._session.get(PlaybackLyricBindingRow, binding_id)
        if row is None:
            return None
        self._session.execute(
            update(PlaybackLyricBindingRow)
            .where(
                PlaybackLyricBindingRow.playback_source_id == row.playback_source_id,
                PlaybackLyricBindingRow.is_active.is_(True),
                PlaybackLyricBindingRow.id != binding_id,
            )
            .values(is_active=False)
        )
        row.is_active = True
        self._session.flush()
        return self._to_binding(row)

    def update_binding_confirmation(
        self,
        binding_id: UUID,
        *,
        match_confidence: int,
        matching_policy_version: str,
        confirmed_at: datetime,
        timing_offset_ms: int,
        duration_difference_ms: int | None,
    ) -> PlaybackLyricBinding | None:
        row = self._session.get(PlaybackLyricBindingRow, binding_id)
        if row is None:
            return None
        row.match_confidence = match_confidence
        row.matching_policy_version = matching_policy_version
        row.confirmed_by_user = True
        row.confirmed_at = confirmed_at
        row.timing_offset_ms = timing_offset_ms
        row.duration_difference_ms = duration_difference_ms
        self._session.flush()
        return self._to_binding(row)

    @staticmethod
    def _to_document(row: LyricDocumentRow) -> LyricDocument:
        return LyricDocument(
            id=row.id,
            track_id=row.track_id,
            language=row.language,
            version=row.version,
            timing_type=TimingType(row.timing_type),
            segments=row.segments,
            source_provider=row.source_provider,
            source_record_id=row.source_record_id,
            attribution=row.attribution,
            rights_capabilities=row.rights_capabilities,
            created_at=row.created_at,
            updated_at=row.updated_at,
        )

    @staticmethod
    def _to_binding(row: PlaybackLyricBindingRow) -> PlaybackLyricBinding:
        return PlaybackLyricBinding(
            id=row.id,
            track_id=row.track_id,
            playback_source_id=row.playback_source_id,
            lyric_document_id=row.lyric_document_id,
            match_confidence=int(row.match_confidence),
            matching_policy_version=row.matching_policy_version,
            confirmed_by_user=row.confirmed_by_user,
            confirmed_at=row.confirmed_at,
            timing_offset_ms=row.timing_offset_ms,
            duration_difference_ms=row.duration_difference_ms,
            is_active=row.is_active,
            created_at=row.created_at,
        )
