"""The schema must be reproducible from an empty PostgreSQL database."""

from alembic import command
from sqlalchemy import create_engine, inspect

from tests.python.conftest import alembic_config

EXPECTED_TABLES = {
    "alembic_version",
    "library_items",
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
