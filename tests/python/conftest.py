"""PostgreSQL fixtures that exercise the real migration boundary."""

import os
import shutil
import socket
import subprocess
from collections.abc import Iterator
from pathlib import Path
from uuid import uuid4

import pytest
from alembic import command
from alembic.config import Config

POSTGRESQL_BIN_DIRECTORIES = (
    Path("/opt/homebrew/opt/postgresql@18/bin"),
    Path("/opt/homebrew/opt/postgresql/bin"),
    Path("/usr/local/opt/postgresql@18/bin"),
)


def _postgres_command(name: str) -> str:
    for directory in POSTGRESQL_BIN_DIRECTORIES:
        fallback = directory / name
        if fallback.exists():
            return str(fallback)
    executable = shutil.which(name)
    if executable:
        return executable
    pytest.skip(f"PostgreSQL command {name!r} is required for persistence tests")


def _available_port() -> int:
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        return int(listener.getsockname()[1])


@pytest.fixture(scope="session")
def postgres_server(
    tmp_path_factory: pytest.TempPathFactory,
) -> Iterator[tuple[str, int]]:
    external_url = os.environ.get("UTASTREAM_TEST_DATABASE_URL")
    if external_url:
        yield external_url.rsplit("/", 1)[0], 0
        return

    root = tmp_path_factory.mktemp("utastream-postgres")
    data = root / "data"
    log = root / "postgres.log"
    port = _available_port()
    initdb = _postgres_command("initdb")
    pg_ctl = _postgres_command("pg_ctl")

    subprocess.run(
        [
            initdb,
            "-D",
            str(data),
            "-U",
            "utastream_test_admin",
            "--auth-host=trust",
            "--auth-local=trust",
            "--no-locale",
            "--encoding=UTF8",
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    subprocess.run(
        [
            pg_ctl,
            "-D",
            str(data),
            "-l",
            str(log),
            "-o",
            f"-F -p {port} -h 127.0.0.1",
            "start",
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    try:
        yield f"postgresql+psycopg://utastream_test_admin@127.0.0.1:{port}", port
    finally:
        subprocess.run(
            [pg_ctl, "-D", str(data), "stop", "-m", "fast"],
            check=True,
            capture_output=True,
            text=True,
        )


@pytest.fixture
def database_url(postgres_server: tuple[str, int]) -> Iterator[str]:
    server_url, _ = postgres_server
    external_url = os.environ.get("UTASTREAM_TEST_DATABASE_URL")
    if external_url:
        yield external_url
        return

    database_name = f"utastream_{uuid4().hex}"
    createdb = _postgres_command("createdb")
    dropdb = _postgres_command("dropdb")
    host = server_url.split("@", 1)[1].split(":", 1)[0]
    port = server_url.rsplit(":", 1)[1]
    subprocess.run(
        [createdb, "-h", host, "-p", port, "-U", "utastream_test_admin", database_name],
        check=True,
        capture_output=True,
        text=True,
    )
    try:
        yield f"{server_url}/{database_name}"
    finally:
        subprocess.run(
            [
                dropdb,
                "-h",
                host,
                "-p",
                port,
                "-U",
                "utastream_test_admin",
                database_name,
            ],
            check=True,
            capture_output=True,
            text=True,
        )


def alembic_config(database_url: str) -> Config:
    config = Config("alembic.ini")
    config.attributes["database_url"] = database_url
    return config


@pytest.fixture
def migrated_database_url(database_url: str) -> str:
    command.upgrade(alembic_config(database_url), "head")
    return database_url
