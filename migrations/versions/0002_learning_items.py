"""Persist learning items independently from playback sources.

Revision ID: 0002_learning_items
Revises: 0001_catalog_library
Create Date: 2026-11-12
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0002_learning_items"
down_revision: str | Sequence[str] | None = "0001_catalog_library"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "learning_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("track_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("lyric_document_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("segment_key", sa.String(length=200), nullable=False),
        sa.Column("selected_text", sa.String(length=1000), nullable=False),
        sa.Column("selection_kind", sa.String(length=32), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["track_id"],
            ["tracks.id"],
            name="fk_learning_items_track_id_tracks",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["lyric_document_id", "track_id"],
            ["lyric_documents.id", "lyric_documents.track_id"],
            name="fk_learning_item_lyric_track",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_learning_items"),
        sa.UniqueConstraint(
            "user_id",
            "lyric_document_id",
            "segment_key",
            "selection_kind",
            "selected_text",
            name="uq_learning_items_user_lyric_selection",
        ),
    )
    op.create_index("ix_learning_items_user_id", "learning_items", ["user_id"])
    op.create_index("ix_learning_items_track_id", "learning_items", ["track_id"])
    op.create_index(
        "ix_learning_items_lyric_document_id",
        "learning_items",
        ["lyric_document_id"],
    )


def downgrade() -> None:
    op.drop_table("learning_items")
