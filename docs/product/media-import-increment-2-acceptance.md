# Media Import Increment 2 Acceptance

**Status:** Complete — pending owner review  
**Date:** 2026-11-10  
**Scope:** PostgreSQL catalog and personal-library persistence

## Delivered

- SQLAlchemy domain persistence for canonical `Track` records, replaceable
  `PlaybackSource` records, source-neutral `LibraryItem` records, versioned
  `LyricDocument` records, and source-specific `PlaybackLyricBinding` records.
- Alembic configuration and a reversible initial migration.
- Catalog and lyric repositories with caller-owned transaction boundaries.
- Database-enforced uniqueness for one user/track library item and one external
  reference per provider source kind.
- Composite foreign keys that reject lyric bindings across different tracks.
- Repository validation that rejects a preferred source from another track.
- Root migration commands and local PostgreSQL setup guidance.

## Acceptance evidence

The API suite starts a disposable PostgreSQL 18 cluster and creates a fresh
database for each persistence test. The tests verify:

1. Migration from an empty database to `head` and downgrade to `base`.
2. Exact parity between the migrated schema and SQLAlchemy metadata.
3. Persistence after engine/session restart.
4. One canonical track retaining local-file and YouTube playback sources while
   the user retains one library item.
5. Rejection of duplicate user/track library items and duplicate provider IDs.
6. Rejection of cross-track preferred sources and lyric bindings.

## Deferred by design

- HTTP catalog/import endpoints and generated TypeScript types belong to
  Increment 3 and later increments.
- User/account tables and authentication are not invented here; `user_id` is a
  stable boundary identifier until the identity decision is implemented.
- Local-file bytes and iframe HTML are not stored. Later adapters will persist
  only the source references and capability/provenance facts allowed by the
  accepted ADRs.
