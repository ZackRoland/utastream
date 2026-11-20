"""Identify one active lyric binding per playback source.

Revision ID: 0003_active_lyric_bindings
Revises: 0002_learning_items
Create Date: 2026-11-19
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0003_active_lyric_bindings"
down_revision: str | Sequence[str] | None = "0002_learning_items"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "playback_lyric_bindings",
        sa.Column(
            "is_active",
            sa.Boolean(),
            server_default=sa.false(),
            nullable=False,
        ),
    )
    op.execute(
        sa.text(
            """
            WITH ranked_bindings AS (
                SELECT
                    id,
                    row_number() OVER (
                        PARTITION BY playback_source_id
                        ORDER BY created_at DESC, id DESC
                    ) AS source_rank
                FROM playback_lyric_bindings
            )
            UPDATE playback_lyric_bindings AS binding
            SET is_active = true
            FROM ranked_bindings
            WHERE binding.id = ranked_bindings.id
              AND ranked_bindings.source_rank = 1
            """
        )
    )
    op.alter_column(
        "playback_lyric_bindings",
        "is_active",
        server_default=sa.true(),
    )
    op.create_index(
        "uq_playback_lyric_bindings_active_source",
        "playback_lyric_bindings",
        ["playback_source_id"],
        unique=True,
        postgresql_where=sa.text("is_active"),
    )


def downgrade() -> None:
    op.drop_index(
        "uq_playback_lyric_bindings_active_source",
        table_name="playback_lyric_bindings",
    )
    op.drop_column("playback_lyric_bindings", "is_active")
