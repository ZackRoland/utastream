"""Repository acceptance tests for canonical tracks and replaceable sources."""

from uuid import uuid4

import pytest
from sqlalchemy.exc import IntegrityError
from utastream.catalog import (
    LibraryItem,
    PlaybackSource,
    PlaybackSourceKind,
    SourceAvailability,
    Track,
)
from utastream.database.repositories.catalog import (
    CatalogRepository,
    PreferredSourceTrackMismatchError,
)
from utastream.database.session import create_database_engine, create_session_factory


def test_track_can_retain_two_sources_and_one_library_identity(
    migrated_database_url: str,
) -> None:
    engine = create_database_engine(migrated_database_url)
    sessions = create_session_factory(engine)
    track = Track(
        canonical_title="夜に駆ける", artist_name="YOASOBI", duration_ms=261_000
    )
    local_source = PlaybackSource(
        track_id=track.id,
        kind=PlaybackSourceKind.LOCAL_FILE,
        availability=SourceAvailability.LOCAL_FILE_REQUIRED,
        original_metadata={"filename": "yoru-ni-kakeru.mp3"},
    )
    youtube_source = PlaybackSource(
        track_id=track.id,
        kind=PlaybackSourceKind.YOUTUBE,
        availability=SourceAvailability.AVAILABLE,
        external_id="x8VYWazR5mE",
        source_uri="https://www.youtube.com/watch?v=x8VYWazR5mE",
    )
    item = LibraryItem(
        user_id=uuid4(),
        track_id=track.id,
        preferred_source_id=youtube_source.id,
    )

    with sessions.begin() as session:
        repository = CatalogRepository(session)
        repository.add_track(track)
        repository.add_playback_source(local_source)
        repository.add_playback_source(youtube_source)
        repository.add_library_item(item)
    engine.dispose()

    restarted_engine = create_database_engine(migrated_database_url)
    with create_session_factory(restarted_engine)() as session:
        repository = CatalogRepository(session)
        persisted = repository.get_library_item(item.user_id, track.id)
        sources = repository.list_playback_sources(track.id)

    assert persisted is not None
    assert persisted.track_id == track.id
    assert persisted.preferred_source_id == youtube_source.id
    assert {source.kind for source in sources} == {
        PlaybackSourceKind.LOCAL_FILE,
        PlaybackSourceKind.YOUTUBE,
    }
    restarted_engine.dispose()


def test_user_cannot_add_the_same_track_twice(migrated_database_url: str) -> None:
    engine = create_database_engine(migrated_database_url)
    sessions = create_session_factory(engine)
    track = Track(canonical_title="Track", artist_name="Artist", duration_ms=1)
    user_id = uuid4()

    with pytest.raises(IntegrityError), sessions.begin() as session:
        repository = CatalogRepository(session)
        repository.add_track(track)
        repository.add_library_item(LibraryItem(user_id=user_id, track_id=track.id))
        repository.add_library_item(LibraryItem(user_id=user_id, track_id=track.id))
    engine.dispose()


def test_external_provider_reference_is_unique(migrated_database_url: str) -> None:
    engine = create_database_engine(migrated_database_url)
    sessions = create_session_factory(engine)
    first = Track(canonical_title="First", artist_name="Artist", duration_ms=1)
    second = Track(canonical_title="Second", artist_name="Artist", duration_ms=1)

    with pytest.raises(IntegrityError), sessions.begin() as session:
        repository = CatalogRepository(session)
        repository.add_track(first)
        repository.add_track(second)
        for track in (first, second):
            repository.add_playback_source(
                PlaybackSource(
                    track_id=track.id,
                    kind=PlaybackSourceKind.YOUTUBE,
                    availability=SourceAvailability.AVAILABLE,
                    external_id="same-video",
                )
            )
    engine.dispose()


def test_preferred_source_must_belong_to_library_track(
    migrated_database_url: str,
) -> None:
    engine = create_database_engine(migrated_database_url)
    sessions = create_session_factory(engine)
    first = Track(canonical_title="First", artist_name="Artist", duration_ms=1)
    second = Track(canonical_title="Second", artist_name="Artist", duration_ms=1)
    source = PlaybackSource(
        track_id=first.id,
        kind=PlaybackSourceKind.FIXTURE,
        availability=SourceAvailability.AVAILABLE,
    )

    with pytest.raises(PreferredSourceTrackMismatchError), sessions.begin() as session:
        repository = CatalogRepository(session)
        repository.add_track(first)
        repository.add_track(second)
        repository.add_playback_source(source)
        repository.add_library_item(
            LibraryItem(
                user_id=uuid4(),
                track_id=second.id,
                preferred_source_id=source.id,
            )
        )
    engine.dispose()
