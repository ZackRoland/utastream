import os
from collections.abc import Iterator
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from utastream.catalog import PlaybackSourceKind, SourceAvailability
from utastream.database.repositories.catalog import CatalogRepository
from utastream.database.repositories.learning import LearningRepository
from utastream.database.repositories.lyrics import LyricsRepository
from utastream.database.session import create_database_engine, create_session_factory
from utastream.lyrics.replacement import (
    LibraryTrackNotFoundError,
    PlaybackSourceNotFoundError,
    ReplaceLyricsCommand,
    replace_active_lyrics,
)
from utastream.track_import import ImportCommand, complete_import

from ..contracts import (
    CompleteTrackImportRequest,
    CompleteTrackImportResponse,
    LearningCollectionResponse,
    LearningItemResponse,
    LibraryLyricDocument,
    LibraryPlaybackSource,
    LibraryResponse,
    LibraryTrack,
    ReplaceTrackLyricsRequest,
    ReplaceTrackLyricsResponse,
    SaveLearningItemRequest,
)
from ..errors import error_responses

router = APIRouter(prefix="/v1", tags=["library"])


def database_session() -> Iterator[Session]:
    database_url = os.environ.get("UTASTREAM_DATABASE_URL")
    if not database_url:
        raise HTTPException(
            status_code=503,
            detail="Database configuration is required for library persistence.",
        )
    engine = create_database_engine(database_url)
    session = create_session_factory(engine)()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
        engine.dispose()


DatabaseSession = Annotated[Session, Depends(database_session)]


@router.post(
    "/track-imports",
    operation_id="completeTrackImport",
    response_model=CompleteTrackImportResponse,
    responses=error_responses(422, 500, 503),
)
def complete_track_import(
    request: CompleteTrackImportRequest,
    session: DatabaseSession,
) -> CompleteTrackImportResponse:
    result = complete_import(
        session,
        ImportCommand(
            user_id=request.user_id,
            title=request.title,
            artist=request.artist,
            album=request.album,
            duration_ms=round(request.source.duration_seconds * 1000),
            source_kind=PlaybackSourceKind(request.source.kind),
            source_availability=SourceAvailability(request.source.availability),
            source_external_id=request.source.external_id,
            source_uri=request.source.normalized_url,
            source_original_metadata=request.source.original_metadata,
            source_capabilities=request.source.capabilities,
            source_provenance=request.source.provenance,
            lyric_provider_record_id=request.lyrics.provider_record_id,
            lyric_version=request.lyrics.lyric_document_version,
            lyric_segments=request.lyrics.normalized_segments,
            lyric_attribution=request.lyrics.attribution,
            lyric_rights_capabilities=request.lyrics.rights_capabilities,
            match_confidence=request.lyrics.score,
            matching_policy_version=request.lyrics.matching_policy_version,
            confirmed_at=request.lyrics.confirmed_at,
            timing_offset_ms=request.lyrics.timing_offset_ms,
            duration_difference_ms=(
                round(request.lyrics.duration_difference_seconds * 1000)
                if request.lyrics.duration_difference_seconds is not None
                else None
            ),
        ),
    )
    return CompleteTrackImportResponse(
        item=_library_track(session, request.user_id, result.track.id),
        track_created=result.track_created,
        source_created=result.source_created,
        library_item_created=result.library_item_created,
    )


@router.get(
    "/users/{user_id}/library",
    operation_id="getUserLibrary",
    response_model=LibraryResponse,
    responses=error_responses(500, 503),
)
def get_user_library(
    user_id: UUID,
    session: DatabaseSession,
) -> LibraryResponse:
    catalog = CatalogRepository(session)
    return LibraryResponse(
        items=[
            _library_track(session, user_id, item.track_id)
            for item in catalog.list_library_items(user_id)
        ]
    )


@router.put(
    "/users/{user_id}/library/{track_id}/sources/{source_id}/lyrics",
    operation_id="replaceLibraryTrackLyrics",
    response_model=ReplaceTrackLyricsResponse,
    responses=error_responses(404, 422, 500, 503),
)
def replace_library_track_lyrics(
    user_id: UUID,
    track_id: UUID,
    source_id: UUID,
    request: ReplaceTrackLyricsRequest,
    session: DatabaseSession,
) -> ReplaceTrackLyricsResponse:
    try:
        replace_active_lyrics(
            session,
            ReplaceLyricsCommand(
                user_id=user_id,
                track_id=track_id,
                playback_source_id=source_id,
                provider_record_id=request.lyrics.provider_record_id,
                segments=request.lyrics.normalized_segments,
                attribution=request.lyrics.attribution,
                rights_capabilities=request.lyrics.rights_capabilities,
                match_confidence=request.lyrics.score,
                matching_policy_version=request.lyrics.matching_policy_version,
                confirmed_at=request.lyrics.confirmed_at,
                timing_offset_ms=request.lyrics.timing_offset_ms,
                duration_difference_ms=(
                    round(request.lyrics.duration_difference_seconds * 1000)
                    if request.lyrics.duration_difference_seconds is not None
                    else None
                ),
            ),
        )
    except (LibraryTrackNotFoundError, PlaybackSourceNotFoundError) as error:
        raise HTTPException(
            status_code=404,
            detail="Library track or playback source was not found.",
        ) from error
    return ReplaceTrackLyricsResponse(item=_library_track(session, user_id, track_id))


@router.post(
    "/learning-items",
    operation_id="saveLearningItem",
    response_model=LearningItemResponse,
    responses=error_responses(422, 500, 503),
)
def save_learning_item(
    request: SaveLearningItemRequest,
    session: DatabaseSession,
) -> LearningItemResponse:
    row = LearningRepository(session).save(
        user_id=request.user_id,
        track_id=request.track_id,
        lyric_document_id=request.lyric_document_id,
        segment_key=request.segment_key,
        selected_text=request.selected_text,
        selection_kind=request.selection_kind,
    )
    return _learning_item(row)


@router.get(
    "/users/{user_id}/learning-items",
    operation_id="getUserLearningItems",
    response_model=LearningCollectionResponse,
    responses=error_responses(500, 503),
)
def get_user_learning_items(
    user_id: UUID,
    session: DatabaseSession,
) -> LearningCollectionResponse:
    rows = LearningRepository(session).list_for_user(user_id)
    return LearningCollectionResponse(items=[_learning_item(row) for row in rows])


def _library_track(session: Session, user_id: UUID, track_id: UUID) -> LibraryTrack:
    catalog = CatalogRepository(session)
    lyrics = LyricsRepository(session)
    track = catalog.get_track(track_id)
    item = catalog.get_library_item(user_id, track_id)
    if track is None or item is None:
        raise HTTPException(status_code=404, detail="Library track was not found.")
    sources = catalog.list_playback_sources(track_id)
    binding = (
        lyrics.get_active_binding(item.preferred_source_id)
        if item.preferred_source_id is not None
        else None
    )
    document = (
        lyrics.get_document(binding.lyric_document_id) if binding is not None else None
    )
    return LibraryTrack(
        library_item_id=item.id,
        track_id=track.id,
        title=track.canonical_title,
        artist=track.artist_name,
        album=track.album_title,
        duration_seconds=track.duration_ms / 1000,
        preferred_source_id=item.preferred_source_id,
        sources=[
            LibraryPlaybackSource(
                id=source.id,
                kind=source.kind.value,
                availability=source.availability.value,
                external_id=source.external_id,
                normalized_url=source.source_uri,
                duration_seconds=(
                    source.duration_ms / 1000
                    if source.duration_ms is not None
                    else None
                ),
                capabilities=source.capabilities,
            )
            for source in sources
        ],
        lyrics=(
            LibraryLyricDocument(
                id=document.id,
                binding_id=binding.id,
                playback_source_id=binding.playback_source_id,
                version=document.version,
                language=document.language,
                timing_type=document.timing_type.value,
                segments=document.segments,
                source_provider=document.source_provider,
                source_record_id=document.source_record_id,
                attribution=document.attribution,
                rights_capabilities=document.rights_capabilities,
                timing_offset_ms=binding.timing_offset_ms,
            )
            if document is not None and binding is not None
            else None
        ),
    )


def _learning_item(row) -> LearningItemResponse:
    return LearningItemResponse(
        id=row.id,
        user_id=row.user_id,
        track_id=row.track_id,
        lyric_document_id=row.lyric_document_id,
        segment_key=row.segment_key,
        selected_text=row.selected_text,
        selection_kind=row.selection_kind,
        created_at=row.created_at,
    )
