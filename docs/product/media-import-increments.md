# Media Import Implementation Increments

**Status:** Active implementation plan  
**Date:** 2026-11-10  
**Governing decisions:** [ADR-0004](../adrs/0004-use-react-fastapi-and-postgresql-as-the-baseline-stack.md), [ADR-0005](../adrs/0005-generate-typescript-api-contracts-from-openapi.md), [ADR-0007](../adrs/0007-use-browser-first-provider-based-media-and-lyrics.md), [ADR-0008](../adrs/0008-identify-tracks-with-metadata-confirmation-and-fingerprinting.md), [ADR-0009](../adrs/0009-model-library-tracks-independently-from-playback-sources.md)

## Objective

A listener can add a track through either a user-selected local file or a
user-supplied YouTube URL, confirm the canonical recording and timed lyrics,
and retain one source-neutral personal-library item and learning history.

In this plan, **local file** means browser selection and playback without
transmitting the audio bytes. General server upload is not included and
requires its own accepted rights, privacy, storage, security, retention,
deletion, quota, delivery-cost, and takedown decision.

## Increment plan

| Increment | Outcome | Acceptance gate |
| --- | --- | --- |
| 1. API and OpenAPI foundation | Locked Python environment, FastAPI process, health/readiness, shared errors and request IDs, deterministic OpenAPI export, and root commands. | The real process starts; API lint/tests pass; the committed OpenAPI document matches the application; existing web gates remain green. |
| 2. Catalog and library persistence | PostgreSQL, Alembic, repositories, and initial `Track`, `PlaybackSource`, `LibraryItem`, `LyricDocument`, and `PlaybackLyricBinding` schema. | Migrations work from empty and across restart; repository tests prove uniqueness, source attachment, and source-neutral library identity. |
| 3. Generated client contract | Generated TypeScript types, thin application-owned fetch transport, API base configuration, and contract drift command. | Regeneration is deterministic; client code consumes generated transport types; drift fails verification. |
| 4. Real fixture media | Rights-documented fixture audio and one persistent browser media session replace the timer behind the playback boundary. | Browser playback, seeking, ended behavior, lyric timing, overlays, and playing/paused continuity pass against real media. |
| 5. Shared add-track experience | One source-choice flow and how-to guidance explain YouTube and local-file tradeoffs and drive a common import state machine. | The flow is keyboard accessible, responsive, explicit about device-local media, and does not duplicate provider-specific confirmation UI. |
| 6. Local-file adapter | Browser file selection, metadata/duration probing, object-URL playback, correction, reselection, and cleanup without media upload. | No file bytes cross the network; revoked/missing local access produces `local file required`; replacement preserves track and learning identity. |
| 7. YouTube adapter | Validated URL/video ID, official visible IFrame player, permitted metadata probing, provider capability states, and source replacement. | No iframe markup or media bytes are stored; unavailable/non-embeddable sources recover without losing the library item; provider UI remains visible and unobscured. |
| 8. Lyric query and confirmation | Shared normalization, LRCLIB adapter, ADR-0008 scoring, candidate confirmation, timing offset, provenance, and versioned source-to-lyric binding. | Strong, ambiguous, missing, rate-limited, timeout, wrong-edition, and timing-offset cases are deterministic; playback remains usable when lyrics fail. |
| 9. Integrated persistence and browser acceptance | Persisted import/library flows, preferred source, merge/replacement behavior, retrieval after restart, and Playwright coverage for both sources. | Importing the same confirmed recording through both sources produces one library item with two sources; learning history survives switching sources and application restart. |

## Sequencing rules

- Increments 1–4 are prerequisites, not optional infrastructure work. They
  prevent provider-specific client types, in-memory library identity, and timer
  behavior from becoming permanent architecture.
- Both source kinds are represented in the shared contracts before either is
  treated as the permanent import model, but adapters may be implemented and
  reviewed one at a time.
- External-provider development uses deterministic fixtures by default. Live
  calls require explicit configuration and bounded behavior.
- Each increment remains independently reviewable and ends with its own tests,
  acceptance record, and commit.

## Completion criteria

The connected/local media objective is complete only when:

1. Both source choices enter the same import and confirmation pipeline.
2. Personal-library identity references a canonical UtaStream track rather
   than a provider record or local filename.
3. A confirmed track can retain both a YouTube and local-file source without a
   duplicate library item.
4. Lyrics retain original provenance and a versioned normalized document.
5. Timing suitability is confirmed per playback source.
6. Source loss or replacement does not invalidate saved learning history.
7. Local audio bytes are not transmitted in the local-file path.
8. YouTube playback uses only the official visible player and stored validated
   provider references.
9. API, migration, contract, client, provider-failure, and browser acceptance
   suites pass from a clean documented setup.

## Progress

| Increment | Status | Evidence |
| --- | --- | --- |
| 1. API and OpenAPI foundation | Complete — pending owner review | FastAPI process, locked uv environment, shared system/error contracts, generated `openapi.json`, Python tests, and root documentation added on 2026-11-10. |
| 2–9 | Not started | Begin only after the preceding increment is reviewed and committed. |
