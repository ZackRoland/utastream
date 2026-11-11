"""Catalog and personal-library database rows."""

from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PostgreSQLUUID
from sqlalchemy.orm import Mapped, mapped_column

from utastream.database.base import Base


class TrackRow(Base):
    __tablename__ = "tracks"
    __table_args__ = (
        CheckConstraint("duration_ms >= 0", name="duration_non_negative"),
    )

    id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    canonical_title: Mapped[str] = mapped_column(String(500))
    artist_name: Mapped[str] = mapped_column(String(500))
    album_title: Mapped[str | None] = mapped_column(String(500))
    duration_ms: Mapped[int]
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class PlaybackSourceRow(Base):
    __tablename__ = "playback_sources"
    __table_args__ = (
        UniqueConstraint(
            "kind", "external_id", name="uq_playback_sources_kind_external_id"
        ),
        UniqueConstraint("id", "track_id", name="uq_playback_sources_id_track_id"),
        CheckConstraint(
            "kind IN ('fixture', 'local_file', 'youtube')",
            name="kind_supported",
        ),
        CheckConstraint(
            "availability IN ('available', 'unavailable', 'local_file_required')",
            name="availability_supported",
        ),
        CheckConstraint(
            "duration_ms IS NULL OR duration_ms >= 0", name="duration_non_negative"
        ),
        CheckConstraint(
            "kind <> 'youtube' OR external_id IS NOT NULL",
            name="youtube_has_external_id",
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
    kind: Mapped[str] = mapped_column(String(32))
    external_id: Mapped[str | None] = mapped_column(String(500))
    source_uri: Mapped[str | None] = mapped_column(String(1000))
    original_metadata: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    duration_ms: Mapped[int | None]
    availability: Mapped[str] = mapped_column(String(32))
    capabilities: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    provenance: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class LibraryItemRow(Base):
    __tablename__ = "library_items"
    __table_args__ = (
        UniqueConstraint(
            "user_id", "track_id", name="uq_library_items_user_id_track_id"
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    user_id: Mapped[UUID] = mapped_column(PostgreSQLUUID(as_uuid=True), index=True)
    track_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("tracks.id", ondelete="CASCADE"),
        index=True,
    )
    preferred_source_id: Mapped[UUID | None] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("playback_sources.id", ondelete="SET NULL"),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
