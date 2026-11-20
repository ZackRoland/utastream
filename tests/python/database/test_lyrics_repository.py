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


def test_binding_activation_retains_history_and_selects_one_active_binding(
    migrated_database_url: str,
) -> None:
    engine = create_database_engine(migrated_database_url)
    sessions = create_session_factory(engine)
    track = Track(canonical_title="First", artist_name="Artist", duration_ms=1)
    source = PlaybackSource(
        track_id=track.id,
        kind=PlaybackSourceKind.FIXTURE,
        availability=SourceAvailability.AVAILABLE,
    )
    first_document = LyricDocument(
        track_id=track.id,
        language="ja",
        version=1,
        timing_type=TimingType.LINE,
        source_provider="fixture",
        source_record_id="first",
        segments=[{"start_ms": 0, "text": "始まり"}],
    )
    replacement_document = LyricDocument(
        track_id=track.id,
        language="ja",
        version=2,
        timing_type=TimingType.LINE,
        source_provider="fixture",
        source_record_id="replacement",
        segments=[{"start_ms": 0, "text": "続き"}],
    )
    first_binding = PlaybackLyricBinding(
        track_id=track.id,
        playback_source_id=source.id,
        lyric_document_id=first_document.id,
        match_confidence=90,
        matching_policy_version="v1",
        confirmed_by_user=True,
        confirmed_at=datetime.now(UTC),
    )
    replacement_binding = PlaybackLyricBinding(
        track_id=track.id,
        playback_source_id=source.id,
        lyric_document_id=replacement_document.id,
        match_confidence=95,
        matching_policy_version="v2",
        confirmed_by_user=True,
        confirmed_at=datetime.now(UTC),
        timing_offset_ms=250,
        is_active=False,
    )

    with sessions.begin() as session:
        catalog = CatalogRepository(session)
        lyrics = LyricsRepository(session)
        catalog.add_track(track)
        catalog.add_playback_source(source)
        lyrics.add_document(first_document)
        lyrics.add_document(replacement_document)
        lyrics.add_binding(first_binding)
        lyrics.add_binding(replacement_binding)
        active = lyrics.get_active_binding(source.id)
        assert active is not None
        assert active.id == first_binding.id
        assert active.is_active is True

        activated = lyrics.activate_binding(replacement_binding.id)

        assert activated is not None
        assert activated.lyric_document_id == replacement_document.id
        assert activated.is_active is True
        assert activated.timing_offset_ms == 250
        assert lyrics.get_active_binding(source.id) == activated
        historical = lyrics.find_binding(
            playback_source_id=source.id,
            lyric_document_id=first_document.id,
        )
        assert historical is not None
        assert historical.is_active is False

    engine.dispose()
