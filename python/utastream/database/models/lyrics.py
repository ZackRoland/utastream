"""Versioned lyric document and playback-binding rows."""

from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Numeric,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PostgreSQLUUID
from sqlalchemy.orm import Mapped, mapped_column

from utastream.database.base import Base


class LyricDocumentRow(Base):
    __tablename__ = "lyric_documents"
    __table_args__ = (
        UniqueConstraint(
            "track_id",
            "language",
            "version",
            name="uq_lyric_documents_track_language_version",
        ),
        UniqueConstraint("id", "track_id", name="uq_lyric_documents_id_track_id"),
        CheckConstraint("version >= 1", name="version_positive"),
        CheckConstraint(
            "timing_type IN ('line', 'word')", name="timing_type_supported"
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    track_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("tracks.id", ondelete="CASCADE"),
        index=True,
    )
    language: Mapped[str] = mapped_column(String(35))
    version: Mapped[int]
    timing_type: Mapped[str] = mapped_column(String(16))
    segments: Mapped[list[dict[str, Any]]] = mapped_column(JSONB)
    source_provider: Mapped[str] = mapped_column(String(120))
    source_record_id: Mapped[str | None] = mapped_column(String(500))
    attribution: Mapped[str | None] = mapped_column(String(1000))
    rights_capabilities: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class PlaybackLyricBindingRow(Base):
    __tablename__ = "playback_lyric_bindings"
    __table_args__ = (
        ForeignKeyConstraint(
            ["playback_source_id", "track_id"],
            ["playback_sources.id", "playback_sources.track_id"],
            ondelete="CASCADE",
            name="fk_binding_source_track",
        ),
        ForeignKeyConstraint(
            ["lyric_document_id", "track_id"],
            ["lyric_documents.id", "lyric_documents.track_id"],
            ondelete="CASCADE",
            name="fk_binding_lyric_track",
        ),
        UniqueConstraint(
            "playback_source_id",
            "lyric_document_id",
            name="uq_playback_lyric_bindings_source_document",
        ),
        CheckConstraint(
            "match_confidence >= 0 AND match_confidence <= 100",
            name="match_confidence_percent",
        ),
        CheckConstraint(
            "(confirmed_by_user AND confirmed_at IS NOT NULL) OR "
            "(NOT confirmed_by_user AND confirmed_at IS NULL)",
            name="confirmation_consistent",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    track_id: Mapped[UUID] = mapped_column(PostgreSQLUUID(as_uuid=True), index=True)
    playback_source_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True), index=True
    )
    lyric_document_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True), index=True
    )
    match_confidence: Mapped[int] = mapped_column(Numeric(5, 2))
    matching_policy_version: Mapped[str] = mapped_column(String(100))
    confirmed_by_user: Mapped[bool] = mapped_column(Boolean, default=False)
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    timing_offset_ms: Mapped[int] = mapped_column(default=0)
    duration_difference_ms: Mapped[int | None]
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
