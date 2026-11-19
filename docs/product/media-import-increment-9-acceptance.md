# Media Import Increment 9 Acceptance

**Status:** Complete — pending owner review  
**Date:** 2026-11-12  
**Scope:** Integrated persistence, restart recovery, and browser acceptance

## Delivered behavior

- One atomic FastAPI operation completes a confirmed import inside a caller-
  owned PostgreSQL transaction.
- Canonical title, artist, and duration matching reuses an existing track
  within the accepted two-second recording tolerance.
- Reimporting the same recording through another adapter reuses the library
  item and lyric document, attaches a second playback source, and makes the
  newly confirmed source preferred.
- Versioned normalized lyrics, provider provenance, per-source confidence,
  matching policy, timing offset, and confirmation time persist together.
- Learning items reference canonical track and lyric-document identities, not
  playback sources.
- The visible library reloads from the API and distinguishes an available
  YouTube source from `local file required`.

## Acceptance evidence

| Gate | Evidence |
| --- | --- |
| Same recording, two sources, one library item | PostgreSQL API acceptance imports local file then YouTube and verifies identical track and library IDs with two source records. |
| Preferred source and replacement | The second confirmed source becomes preferred while the first source remains attached and replaceable. |
| Restart retrieval | The acceptance test creates new API clients after writes and retrieves the same library, lyric version, sources, and learning item. |
| Learning identity survives source change | A learning item is saved after local import, YouTube is attached, and the same learning-item ID is retrieved after restart. |
| Local bytes remain local | The completion contract contains metadata and capability facts only; it has no file, byte, object URL, or media-upload field. |
| Missing local access is explicit | Persisted local sources return `local_file_required`, rendered as “Local file required” in the library. |
| Browser paths work | Playwright selects and probes the real fixture audio for the local path and supplies a visible deterministic IFrame Player boundary for YouTube; both complete shared lyric confirmation and render a library item. |
| Contracts and migrations stay reproducible | OpenAPI generation, TypeScript generation, Alembic upgrade/downgrade, metadata parity, Python lint, API tests, web tests, typecheck, and production build are included in the final gate. |

## Identity flow

```text
confirmed recording
  -> find or create canonical Track
  -> find or attach PlaybackSource
  -> find or create versioned LyricDocument
  -> find or create source-specific PlaybackLyricBinding
  -> find or create user LibraryItem
  -> update preferred source
```

Learning items continue to reference the canonical track and lyric document,
so source replacement cannot invalidate their identity.

## Boundaries retained

- Device-local audio bytes are not uploaded or stored.
- YouTube iframe markup and media are not accepted or persisted.
- LRCLIB rights capabilities remain explicitly unknown.
- Authentication, production lyric licensing, durable device file handles,
  public deployment, and general media upload remain separate objectives.
