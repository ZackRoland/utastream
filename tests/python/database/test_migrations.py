"""The schema must be reproducible from an empty PostgreSQL database."""

from datetime import UTC, datetime, timedelta
from uuid import uuid4

from alembic import command
from sqlalchemy import create_engine, inspect, text

from tests.python.conftest import alembic_config

EXPECTED_TABLES = {
    "alembic_version",
    "library_items",
    "learning_items",
    "lyric_documents",
    "playback_lyric_bindings",
    "playback_sources",
    "tracks",
}


def test_initial_migration_upgrades_and_downgrades(database_url: str) -> None:
    config = alembic_config(database_url)
    command.upgrade(config, "head")

    engine = create_engine(database_url)
    with engine.connect() as connection:
        assert set(inspect(connection).get_table_names()) == EXPECTED_TABLES
    engine.dispose()

    command.downgrade(config, "base")
    engine = create_engine(database_url)
    with engine.connect() as connection:
        assert inspect(connection).get_table_names() == ["alembic_version"]
    engine.dispose()


def test_migration_matches_sqlalchemy_metadata(database_url: str) -> None:
    config = alembic_config(database_url)
    command.upgrade(config, "head")

    from alembic.autogenerate import compare_metadata
    from alembic.runtime.migration import MigrationContext
    from utastream.database import models  # noqa: F401
    from utastream.database.base import Base

    engine = create_engine(database_url)
    with engine.connect() as connection:
        context = MigrationContext.configure(connection)
        assert compare_metadata(context, Base.metadata) == []
    engine.dispose()


def test_active_binding_migration_selects_latest_binding_per_source(
    database_url: str,
) -> None:
    config = alembic_config(database_url)
    command.upgrade(config, "0002_learning_items")
    engine = create_engine(database_url)
    track_id = uuid4()
    source_id = uuid4()
    first_document_id = uuid4()
    replacement_document_id = uuid4()
    first_binding_id = uuid4()
    replacement_binding_id = uuid4()
    created_at = datetime(2026, 11, 1, tzinfo=UTC)

    with engine.begin() as connection:
        connection.execute(
            text(
                """
                INSERT INTO tracks (
                    id, canonical_title, artist_name, duration_ms
                ) VALUES (:id, 'First', 'Artist', 1000)
                """
            ),
            {"id": track_id},
        )
        connection.execute(
            text(
                """
                INSERT INTO playback_sources (
                    id, track_id, kind, original_metadata, duration_ms,
                    availability, capabilities, provenance
                ) VALUES (
                    :id, :track_id, 'fixture', '{}'::jsonb, 1000,
                    'available', '{}'::jsonb, '{}'::jsonb
                )
                """
            ),
            {"id": source_id, "track_id": track_id},
        )
        connection.execute(
            text(
                """
                INSERT INTO lyric_documents (
                    id, track_id, language, version, timing_type, segments,
                    source_provider, source_record_id, rights_capabilities
                ) VALUES
                    (
                        :first_id, :track_id, 'ja', 1, 'line', '[]'::jsonb,
                        'fixture', 'first', '{}'::jsonb
                    ),
                    (
                        :replacement_id, :track_id, 'ja', 2, 'line',
                        '[]'::jsonb, 'fixture', 'replacement', '{}'::jsonb
                    )
                """
            ),
            {
                "first_id": first_document_id,
                "replacement_id": replacement_document_id,
                "track_id": track_id,
            },
        )
        connection.execute(
            text(
                """
                INSERT INTO playback_lyric_bindings (
                    id, track_id, playback_source_id, lyric_document_id,
                    match_confidence, matching_policy_version,
                    confirmed_by_user, confirmed_at, timing_offset_ms,
                    duration_difference_ms, created_at
                ) VALUES
                    (
                        :first_id, :track_id, :source_id, :first_document_id,
                        90, 'v1', true, :first_created_at, 0, 0,
                        :first_created_at
                    ),
                    (
                        :replacement_id, :track_id, :source_id,
                        :replacement_document_id, 95, 'v2', true,
                        :replacement_created_at, 250, 0,
                        :replacement_created_at
                    )
                """
            ),
            {
                "first_id": first_binding_id,
                "replacement_id": replacement_binding_id,
                "track_id": track_id,
                "source_id": source_id,
                "first_document_id": first_document_id,
                "replacement_document_id": replacement_document_id,
                "first_created_at": created_at,
                "replacement_created_at": created_at + timedelta(days=1),
            },
        )

    command.upgrade(config, "head")

    with engine.connect() as connection:
        bindings = connection.execute(
            text(
                """
                SELECT id, is_active
                FROM playback_lyric_bindings
                WHERE playback_source_id = :source_id
                ORDER BY created_at
                """
            ),
            {"source_id": source_id},
        ).all()
        assert bindings == [
            (first_binding_id, False),
            (replacement_binding_id, True),
        ]

    engine.dispose()
