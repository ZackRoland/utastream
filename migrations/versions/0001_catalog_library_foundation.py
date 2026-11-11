"""Create the source-neutral catalog and library foundation.

Revision ID: 0001_catalog_library
Revises:
Create Date: 2026-11-10
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001_catalog_library"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "tracks",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("canonical_title", sa.String(length=500), nullable=False),
        sa.Column("artist_name", sa.String(length=500), nullable=False),
        sa.Column("album_title", sa.String(length=500), nullable=True),
        sa.Column("duration_ms", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint("duration_ms >= 0", name="ck_tracks_duration_non_negative"),
        sa.PrimaryKeyConstraint("id", name="pk_tracks"),
    )
    op.create_table(
        "playback_sources",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("track_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("kind", sa.String(length=32), nullable=False),
        sa.Column("external_id", sa.String(length=500), nullable=True),
        sa.Column("source_uri", sa.String(length=1000), nullable=True),
        sa.Column(
            "original_metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=False
        ),
        sa.Column("duration_ms", sa.Integer(), nullable=True),
        sa.Column("availability", sa.String(length=32), nullable=False),
        sa.Column(
            "capabilities", postgresql.JSONB(astext_type=sa.Text()), nullable=False
        ),
        sa.Column(
            "provenance", postgresql.JSONB(astext_type=sa.Text()), nullable=False
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "availability IN ('available', 'unavailable', 'local_file_required')",
            name="ck_playback_sources_availability_supported",
        ),
        sa.CheckConstraint(
            "duration_ms IS NULL OR duration_ms >= 0",
            name="ck_playback_sources_duration_non_negative",
        ),
        sa.CheckConstraint(
            "kind IN ('fixture', 'local_file', 'youtube')",
            name="ck_playback_sources_kind_supported",
        ),
        sa.CheckConstraint(
            "kind <> 'youtube' OR external_id IS NOT NULL",
            name="ck_playback_sources_youtube_has_external_id",
        ),
        sa.ForeignKeyConstraint(
            ["track_id"],
            ["tracks.id"],
            name="fk_playback_sources_track_id_tracks",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_playback_sources"),
        sa.UniqueConstraint("id", "track_id", name="uq_playback_sources_id_track_id"),
        sa.UniqueConstraint(
            "kind", "external_id", name="uq_playback_sources_kind_external_id"
        ),
    )
    op.create_index("ix_playback_sources_track_id", "playback_sources", ["track_id"])
    op.create_table(
        "library_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("track_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("preferred_source_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["preferred_source_id"],
            ["playback_sources.id"],
            name="fk_library_items_preferred_source_id_playback_sources",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["track_id"],
            ["tracks.id"],
            name="fk_library_items_track_id_tracks",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_library_items"),
        sa.UniqueConstraint(
            "user_id", "track_id", name="uq_library_items_user_id_track_id"
        ),
    )
    op.create_index("ix_library_items_track_id", "library_items", ["track_id"])
    op.create_index("ix_library_items_user_id", "library_items", ["user_id"])
    op.create_table(
        "lyric_documents",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("track_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("language", sa.String(length=35), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("timing_type", sa.String(length=16), nullable=False),
        sa.Column("segments", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("source_provider", sa.String(length=120), nullable=False),
        sa.Column("source_record_id", sa.String(length=500), nullable=True),
        sa.Column("attribution", sa.String(length=1000), nullable=True),
        sa.Column(
            "rights_capabilities",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "timing_type IN ('line', 'word')",
            name="ck_lyric_documents_timing_type_supported",
        ),
        sa.CheckConstraint("version >= 1", name="ck_lyric_documents_version_positive"),
        sa.ForeignKeyConstraint(
            ["track_id"],
            ["tracks.id"],
            name="fk_lyric_documents_track_id_tracks",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_lyric_documents"),
        sa.UniqueConstraint("id", "track_id", name="uq_lyric_documents_id_track_id"),
        sa.UniqueConstraint(
            "track_id",
            "language",
            "version",
            name="uq_lyric_documents_track_language_version",
        ),
    )
    op.create_index("ix_lyric_documents_track_id", "lyric_documents", ["track_id"])
    op.create_table(
        "playback_lyric_bindings",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("track_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("playback_source_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("lyric_document_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("match_confidence", sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column("matching_policy_version", sa.String(length=100), nullable=False),
        sa.Column("confirmed_by_user", sa.Boolean(), nullable=False),
        sa.Column("confirmed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("timing_offset_ms", sa.Integer(), nullable=False),
        sa.Column("duration_difference_ms", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "(confirmed_by_user AND confirmed_at IS NOT NULL) OR "
            "(NOT confirmed_by_user AND confirmed_at IS NULL)",
            name="ck_playback_lyric_bindings_confirmation_consistent",
        ),
        sa.CheckConstraint(
            "match_confidence >= 0 AND match_confidence <= 100",
            name="ck_playback_lyric_bindings_match_confidence_percent",
        ),
        sa.ForeignKeyConstraint(
            ["lyric_document_id", "track_id"],
            ["lyric_documents.id", "lyric_documents.track_id"],
            name="fk_playback_lyric_bindings_document_track",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["playback_source_id", "track_id"],
            ["playback_sources.id", "playback_sources.track_id"],
            name="fk_playback_lyric_bindings_source_track",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_playback_lyric_bindings"),
        sa.UniqueConstraint(
            "playback_source_id",
            "lyric_document_id",
            name="uq_playback_lyric_bindings_source_document",
        ),
    )
    op.create_index(
        "ix_playback_lyric_bindings_lyric_document_id",
        "playback_lyric_bindings",
        ["lyric_document_id"],
    )
    op.create_index(
        "ix_playback_lyric_bindings_playback_source_id",
        "playback_lyric_bindings",
        ["playback_source_id"],
    )
    op.create_index(
        "ix_playback_lyric_bindings_track_id", "playback_lyric_bindings", ["track_id"]
    )


def downgrade() -> None:
    op.drop_table("playback_lyric_bindings")
    op.drop_table("lyric_documents")
    op.drop_table("library_items")
    op.drop_table("playback_sources")
    op.drop_table("tracks")
