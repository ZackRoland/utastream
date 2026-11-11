"""Lyric bindings cannot join sources and documents from different tracks."""

from datetime import UTC, datetime

import pytest
from sqlalchemy.exc import IntegrityError
from utastream.catalog import (
    PlaybackSource,
    PlaybackSourceKind,
    SourceAvailability,
    Track,
)
from utastream.database.repositories import CatalogRepository, LyricsRepository
from utastream.database.session import create_database_engine, create_session_factory
from utastream.lyrics import LyricDocument, PlaybackLyricBinding, TimingType


def test_playback_lyric_binding_is_track_scoped(migrated_database_url: str) -> None:
    engine = create_database_engine(migrated_database_url)
    sessions = create_session_factory(engine)
    first = Track(canonical_title="First", artist_name="Artist", duration_ms=1)
    second = Track(canonical_title="Second", artist_name="Artist", duration_ms=1)
    source = PlaybackSource(
        track_id=first.id,
        kind=PlaybackSourceKind.FIXTURE,
        availability=SourceAvailability.AVAILABLE,
    )
    lyrics = LyricDocument(
        track_id=second.id,
        language="ja",
        version=1,
        timing_type=TimingType.LINE,
        source_provider="fixture",
        segments=[{"start_ms": 0, "text": "始まり"}],
    )

    with pytest.raises(IntegrityError), sessions.begin() as session:
        catalog = CatalogRepository(session)
        lyric_repository = LyricsRepository(session)
        catalog.add_track(first)
        catalog.add_track(second)
        catalog.add_playback_source(source)
        lyric_repository.add_document(lyrics)
        lyric_repository.add_binding(
            PlaybackLyricBinding(
                track_id=first.id,
                playback_source_id=source.id,
                lyric_document_id=lyrics.id,
                match_confidence=90,
                matching_policy_version="v1",
                confirmed_by_user=True,
                confirmed_at=datetime.now(UTC),
            )
        )
    engine.dispose()
