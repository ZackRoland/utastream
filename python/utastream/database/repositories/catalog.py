"""SQLAlchemy repository for source-neutral tracks and libraries."""

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from utastream.catalog import (
    LibraryItem,
    PlaybackSource,
    PlaybackSourceKind,
    SourceAvailability,
    Track,
)
from utastream.database.models import LibraryItemRow, PlaybackSourceRow, TrackRow


class PreferredSourceTrackMismatchError(ValueError):
    """Raised when a preferred playback source belongs to another track."""


class CatalogRepository:
    """Persist catalog aggregates without owning transaction boundaries."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def add_track(self, track: Track) -> Track:
        self._session.add(
            TrackRow(
                id=track.id,
                canonical_title=track.canonical_title,
                artist_name=track.artist_name,
                album_title=track.album_title,
                duration_ms=track.duration_ms,
            )
        )
        self._session.flush()
        return track

    def find_matching_track(
        self,
        *,
        canonical_title: str,
        artist_name: str,
        duration_ms: int,
        tolerance_ms: int = 2_000,
    ) -> Track | None:
        row = self._session.scalar(
            select(TrackRow).where(
                func.lower(TrackRow.canonical_title) == canonical_title.casefold(),
                func.lower(TrackRow.artist_name) == artist_name.casefold(),
                func.abs(TrackRow.duration_ms - duration_ms) <= tolerance_ms,
            )
        )
        return self._to_track(row) if row is not None else None

    def get_track(self, track_id: UUID) -> Track | None:
        row = self._session.get(TrackRow, track_id)
        if row is None:
            return None
        return self._to_track(row)

    @staticmethod
    def _to_track(row: TrackRow) -> Track:
        return Track(
            id=row.id,
            canonical_title=row.canonical_title,
            artist_name=row.artist_name,
            album_title=row.album_title,
            duration_ms=row.duration_ms,
            created_at=row.created_at,
            updated_at=row.updated_at,
        )

    def add_playback_source(self, source: PlaybackSource) -> PlaybackSource:
        self._session.add(
            PlaybackSourceRow(
                id=source.id,
                track_id=source.track_id,
                kind=source.kind.value,
                external_id=source.external_id,
                source_uri=source.source_uri,
                original_metadata=source.original_metadata,
                duration_ms=source.duration_ms,
                availability=source.availability.value,
                capabilities=source.capabilities,
                provenance=source.provenance,
            )
        )
        self._session.flush()
        return source

    def list_playback_sources(self, track_id: UUID) -> list[PlaybackSource]:
        rows = self._session.scalars(
            select(PlaybackSourceRow)
            .where(PlaybackSourceRow.track_id == track_id)
            .order_by(PlaybackSourceRow.created_at, PlaybackSourceRow.id)
        )
        return [
            PlaybackSource(
                id=row.id,
                track_id=row.track_id,
                kind=PlaybackSourceKind(row.kind),
                external_id=row.external_id,
                source_uri=row.source_uri,
                original_metadata=row.original_metadata,
                duration_ms=row.duration_ms,
                availability=SourceAvailability(row.availability),
                capabilities=row.capabilities,
                provenance=row.provenance,
                created_at=row.created_at,
                updated_at=row.updated_at,
            )
            for row in rows
        ]

    def get_playback_source(self, source_id: UUID) -> PlaybackSource | None:
        row = self._session.get(PlaybackSourceRow, source_id)
        if row is None:
            return None
        return PlaybackSource(
            id=row.id,
            track_id=row.track_id,
            kind=PlaybackSourceKind(row.kind),
            external_id=row.external_id,
            source_uri=row.source_uri,
            original_metadata=row.original_metadata,
            duration_ms=row.duration_ms,
            availability=SourceAvailability(row.availability),
            capabilities=row.capabilities,
            provenance=row.provenance,
            created_at=row.created_at,
            updated_at=row.updated_at,
        )

    def find_playback_source(
        self,
        *,
        track_id: UUID,
        kind: PlaybackSourceKind,
        external_id: str | None,
        filename: str | None = None,
    ) -> PlaybackSource | None:
        for source in self.list_playback_sources(track_id):
            if source.kind != kind:
                continue
            if external_id is not None and source.external_id == external_id:
                return source
            if (
                kind == PlaybackSourceKind.LOCAL_FILE
                and filename
                and source.original_metadata.get("filename") == filename
            ):
                return source
        return None

    def add_library_item(self, item: LibraryItem) -> LibraryItem:
        if item.preferred_source_id is not None:
            source = self._session.get(PlaybackSourceRow, item.preferred_source_id)
            if source is None or source.track_id != item.track_id:
                raise PreferredSourceTrackMismatchError(
                    "preferred playback source must belong to the library item's track"
                )
        self._session.add(
            LibraryItemRow(
                id=item.id,
                user_id=item.user_id,
                track_id=item.track_id,
                preferred_source_id=item.preferred_source_id,
            )
        )
        self._session.flush()
        return item

    def get_library_item(self, user_id: UUID, track_id: UUID) -> LibraryItem | None:
        row = self._session.scalar(
            select(LibraryItemRow).where(
                LibraryItemRow.user_id == user_id,
                LibraryItemRow.track_id == track_id,
            )
        )
        if row is None:
            return None
        return LibraryItem(
            id=row.id,
            user_id=row.user_id,
            track_id=row.track_id,
            preferred_source_id=row.preferred_source_id,
            created_at=row.created_at,
            updated_at=row.updated_at,
        )

    def set_preferred_source(
        self,
        *,
        user_id: UUID,
        track_id: UUID,
        preferred_source_id: UUID,
    ) -> LibraryItem:
        source = self._session.get(PlaybackSourceRow, preferred_source_id)
        row = self._session.scalar(
            select(LibraryItemRow).where(
                LibraryItemRow.user_id == user_id,
                LibraryItemRow.track_id == track_id,
            )
        )
        if row is None or source is None or source.track_id != track_id:
            raise PreferredSourceTrackMismatchError(
                "preferred playback source must belong to the library item's track"
            )
        row.preferred_source_id = preferred_source_id
        self._session.flush()
        return LibraryItem(
            id=row.id,
            user_id=row.user_id,
            track_id=row.track_id,
            preferred_source_id=row.preferred_source_id,
            created_at=row.created_at,
            updated_at=row.updated_at,
        )

    def list_library_items(self, user_id: UUID) -> list[LibraryItem]:
        rows = self._session.scalars(
            select(LibraryItemRow)
            .where(LibraryItemRow.user_id == user_id)
            .order_by(LibraryItemRow.created_at, LibraryItemRow.id)
        )
        return [
            LibraryItem(
                id=row.id,
                user_id=row.user_id,
                track_id=row.track_id,
                preferred_source_id=row.preferred_source_id,
                created_at=row.created_at,
                updated_at=row.updated_at,
            )
            for row in rows
        ]
