# UtaStream Walking Skeleton v1

**Status:** Proposed  
**Date:** 2026-10-23  
**Owner:** Zack Roland  
**Related decisions:** [ADR-0002](../adrs/0002-start-with-a-modular-monolith-and-vertical-slices.md), [ADR-0004](../adrs/0004-use-react-fastapi-and-postgresql-as-the-baseline-stack.md), [ADR-0005](../adrs/0005-generate-typescript-api-contracts-from-openapi.md), [ADR-0007](../adrs/0007-use-browser-first-provider-based-media-and-lyrics.md), [ADR-0008](../adrs/0008-identify-tracks-with-metadata-confirmation-and-fingerprinting.md)

## Purpose

The first walking skeleton proves that UtaStream's core listening-to-learning
loop works across the selected client, API, database, and worker-shaped
architecture. It is intentionally narrow: one seeded collection, one permitted
track, one timed lyric document, fixture explanations, and one test user.

This is not a visual-only prototype. The slice should exercise real application
boundaries, OpenAPI-generated client types, PostgreSQL persistence, browser
audio state, and automated tests without requiring paid services.

ADR-0007 adds a subsequent connected-mode experiment using an official visible
YouTube embed and LRCLIB. That experiment does not replace this deterministic
fixture slice. It reuses the playback, lyrics, explanation, learning, and
continuity contracts after the fixture path works.

## User journey

```text
Open seeded collection
  -> choose one permitted track
  -> play audio
  -> fetch and synchronize lyrics
  -> toggle translations on or off
  -> select an expression or kanji
  -> view a fixture explanation
  -> save the expression or kanji in context
  -> close the explanation
  -> continue playback from the same position
```

## Success outcome

A listener can begin a permitted track, follow its synchronized Japanese lyrics,
optionally show translations, inspect one selectable expression or individual
kanji, save that learning item with its song and lyric context, dismiss the
learning surface, and continue listening without an unintended pause, restart,
or loss of position.

## Scope

### Included

- One seeded collection containing one permitted track.
- Seeded artwork and audio whose permitted use is documented.
- Standard browser audio playback with play and pause.
- A visible elapsed-time and duration display.
- One versioned lyric document containing timed Japanese lyric segments.
- An active lyric state derived from the audio element's current time.
- Optional fixture translations that can be toggled on and off.
- At least one selectable multi-character expression.
- At least one selectable individual kanji.
- A fixture explanation surface for each selectable learning item.
- Saving a selected expression or kanji with its source context.
- Closing the explanation without disturbing playback continuity.
- One seeded or development test-user identity.
- PostgreSQL persistence for saved learning items.
- Loading, empty, validation, not-found, and recoverable API-error states needed
  by this journey.
- Keyboard-accessible controls and visible focus states.
- Reduced-motion-safe behavior for the explanation surface.

### Explicitly excluded

- Account registration, login, password recovery, and multi-device identity.
- Open-ended catalog search and recommendations.
- User uploads, YouTube ingestion, or third-party music-provider integration.
- Automatic transcription, lyric alignment, translation, or AI explanation.
- Furigana generation or learner-level adaptation.
- Editing lyric timings or fixture explanations.
- Full deck management and spaced-repetition review.
- Offline playback and downloads.
- Background audio guarantees outside the active browser context.
- Native mobile applications.
- Social features, analytics products, subscriptions, and billing.
- A production cloud provider, CDN, dedicated cache, or dedicated message broker.

The YouTube exclusion applies to this first deterministic slice, not to the
follow-on connected experiment accepted in ADR-0007.

## Interaction requirements

### 1. Open the seeded collection

- The initial route presents one seeded collection with artwork, title, creator
  or curator, and its permitted track.
- The track row exposes title, artist, duration, and a clear play affordance.
- Collection and track identifiers are stable UtaStream identifiers rather than
  filenames or provider identifiers.
- If the collection cannot load, the user sees a recoverable error and retry
  control rather than an empty page.

### 2. Choose and play the track

- Activating the track opens the Now Playing experience and prepares the audio.
- Playback starts only in response to an eligible user action so browser autoplay
  restrictions are respected.
- Play and pause controls expose their current state to assistive technology.
- Loading, playable, playing, paused, ended, and playback-error states are
  distinguishable.
- Audio bytes are served from the permitted fixture/media boundary, not stored
  in PostgreSQL or embedded in an ordinary JSON response.

### 3. Fetch and synchronize lyrics

- The client fetches a versioned lyric document for the selected track.
- Each lyric segment has a stable identifier, start time, end time, Japanese
  text, optional fixture translation, and selectable-item annotations.
- Exactly one segment is active when the current playback time falls within a
  segment's time range.
- Before the first segment and after the final segment, the lyric view remains
  stable and does not select an incorrect line.
- Lyric fetching or rendering does not pause or recreate the audio element.
- The active line is visually distinguishable without relying on color alone.

### 4. Toggle translations

- The lyric view contains one control that toggles fixture translations for all
  visible lyric segments.
- Japanese remains present and primary in both states.
- Toggling translation does not change playback state, current time, active
  lyric identity, or manual scroll position unnecessarily.
- The current state is communicated through visible copy and an accessible
  pressed or switch state.
- The preference may be local and session-scoped in this slice; server-side
  profile persistence is deferred.

### 5. Select an expression or kanji

- Annotated expressions and kanji are keyboard reachable and visibly selectable.
- Selection carries the selected text, selection kind (`expression` or `kanji`),
  lyric segment identifier, lyric-document version, track identifier, and
  surrounding sentence context.
- Selecting an item opens the same explanation surface without automatically
  pausing playback.
- Selecting an unannotated character or text range does not issue an explanation
  request in this slice.

### 6. View the fixture explanation

- The explanation surface retains visible track or lyric context.
- An expression fixture contains the expression, reading, contextual meaning,
  concise explanation, and source sentence.
- A kanji fixture contains the character, relevant reading in context,
  contextual meaning, concise note, and source sentence.
- The surface provides Save and Close controls.
- Missing fixture data produces a recoverable, non-destructive state.
- Opening the surface does not replace or remount the player.

### 7. Save the learning item

- Saving creates one persisted learning record for the test user.
- The record references the track, lyric-document version, lyric segment, and
  explanation fixture rather than copying the entire source documents.
- The record stores selected text and selection kind as a historical snapshot.
- Repeating the same save is idempotent for the same user, source version, and
  selected item.
- Success appears inline without navigating away or closing the player.
- A failed save preserves the explanation and offers a retry.

### 8. Close and continue playback

- Closing returns focus to the selected lyric item or another intentional
  element in the lyric context.
- If audio was playing before the explanation opened, it remains playing unless
  the user paused it.
- If audio was paused, it remains paused.
- The playback position must not reset, jump to the selected lyric, or drift
  beyond normal media playback progression.
- The active lyric resumes tracking the same audio element and current time.

## Playback-continuity invariant

Opening, interacting with, saving from, or closing any learning surface must not
recreate the audio element or replace the active playback session.

Automated verification should compare playback state and time immediately before
opening the explanation with the state after closing it:

- A playing track remains playing and advances normally.
- A paused track remains paused at approximately the same time.
- No navigation in this journey resets the track to zero.

Browser scheduling and media timing make exact millisecond equality
inappropriate. Tests should use a documented tolerance while still detecting
restarts and material jumps.

## Minimum data model

| Record | Minimum responsibility |
| --- | --- |
| `Collection` | Seeded grouping and display metadata |
| `Artist` | Stable artist identity and name |
| `Track` | Song metadata, duration, artwork reference, and playable asset reference |
| `MediaAsset` | Permitted fixture location, media type, provenance, and rights metadata |
| `LyricDocument` | Track association, language, version, attribution, and timing source |
| `LyricSegment` | Stable segment identity, start/end timing, Japanese text, and optional translation |
| `SelectableItem` | Expression or kanji span, fixture explanation reference, and source segment |
| `Explanation` | Versioned fixture reading, contextual meaning, explanation, and provenance |
| `SavedLearningItem` | Test user, source references, selected-text snapshot, kind, and saved timestamp |

The exact table design remains an implementation decision. These responsibilities
must remain distinguishable even if some fixture content is initially loaded
from files rather than relational tables.

## Initial API surface

The exact path names may be refined while implementing ADR-0005, but the first
contract must cover these capabilities:

| Method and conceptual path | Responsibility |
| --- | --- |
| `GET /health` | Process liveness |
| `GET /ready` | Dependency readiness without exposing secrets |
| `GET /v1/collections/seeded` | Seeded collection and track summary |
| `GET /v1/tracks/{track_id}` | Track metadata and permitted playback reference |
| `GET /v1/tracks/{track_id}/lyrics` | Versioned timed lyrics, translations, and selectable annotations |
| `GET /v1/explanations/{explanation_id}` | Fixture explanation for an annotated item |
| `POST /v1/saved-learning-items` | Idempotently save an item in source context |
| `GET /v1/saved-learning-items` | Verify persisted saves for the test user |

API contracts must use the shared error envelope, stable operation identifiers,
pagination where a collection may grow, and the OpenAPI generation workflow in
ADR-0005.

## State ownership

| State | Owner in this slice |
| --- | --- |
| Audio element, playback state, current time, and active track session | Web client |
| Translation visibility | Web client, session/local preference |
| Collection, track, lyric, annotation, and explanation fixtures | Application API through fixture-backed repositories/providers |
| Saved learning item | Learning module and PostgreSQL |
| Current selected item and explanation visibility | Web client |
| Media permission and provenance | Catalog/media boundary |

## Required states

The slice must cover these non-ideal states where they apply:

- Initial loading.
- Empty seeded collection caused by fixture/configuration error.
- Track not found.
- Audio loading and playback failure.
- Lyric loading failure with playback still usable.
- Lyric document with a timing gap.
- Explanation fixture not found.
- Save validation failure.
- Temporary save failure with retry.
- Already-saved item.
- Keyboard focus after opening and closing the explanation.

## Accessibility baseline

- All controls have accessible names and keyboard operation.
- Selectable lyric items do not depend on pointer-only interaction.
- Focus moves into the explanation surface and returns predictably on close.
- Visible focus is not removed.
- Active lyric and saved state do not rely on color alone.
- Translation visibility is announced through control state rather than a toast
  alone.
- Motion respects reduced-motion preferences.
- Japanese text remains readable when zoomed and is not embedded in artwork.

## Test requirements

### Python unit and integration tests

- Timed-segment selection at boundaries and gaps.
- Retrieval of seeded collection, track, lyric, selectable item, and explanation.
- Save validation and source-reference integrity.
- Idempotent repeated save.
- Persistence across API restart or new database session.
- Standard not-found and validation error envelopes.

### Contract tests

- OpenAPI export and generated TypeScript types are current.
- UUID, timestamp, enum, nullability, timing, and error representations conform
  to ADR-0005.
- Each required route declares explicit success and error responses.

### Client tests

- Translation toggle preserves Japanese text and active lyric identity.
- Expression and kanji annotations are accessible and selectable.
- Explanation renders the correct fixture shape for each selection kind.
- Save success, already-saved, and recoverable failure states.
- Focus returns appropriately after closing the explanation.

### Browser-level acceptance tests

At least one Playwright scenario must exercise the complete user journey. Media
timing may use a deterministic permitted fixture designed for testing.

Required assertions include:

- The track enters playing state after a user action.
- The active lyric changes as playback time advances.
- Translation text appears and disappears without losing playback.
- An expression explanation opens and saves successfully.
- A kanji explanation opens through the same interaction model.
- The persisted save can be retrieved after the explanation closes.
- Closing the explanation preserves playing/paused state and playback position.
- The journey is operable with keyboard input.

## Definition of done

The walking skeleton is complete when:

1. The full journey runs locally from a clean documented setup without paid
   accounts.
2. The permitted media and its provenance are documented.
3. Client, API, PostgreSQL, and generated OpenAPI contract participate in the
   journey.
4. Both an expression and a kanji can open fixture explanations.
5. At least one learning item persists idempotently in PostgreSQL.
6. Playback continuity passes automated browser verification.
7. Required unit, integration, contract, client, and end-to-end tests pass.
8. Loading and recoverable failure states do not destroy playback state.
9. The implementation contains no calls to paid AI, transcription, translation,
   or media services.
10. Known deviations are documented and approved rather than silently omitted.

## Open questions before implementation

- Which permitted audio and artwork fixture will be used, and under what terms?
- Will fixture lyrics and translations be original project content, public
  domain, permissively licensed, or separately authorized?
- Should selecting a kanji show only its contextual reading or a slightly wider
  fixture entry while still avoiding dictionary-scale scope?
- Should translation visibility persist across a browser restart in v1, or only
  for the active session?
- What timing tolerance should the browser test use on supported browsers?

## Change History

| Date | Change | Author |
| --- | --- | --- |
| 2026-10-23 | Initial proposed walking skeleton based on the owner-defined core journey | Codex with Zack Roland |
| 2026-10-27 | Clarified that YouTube plus LRCLIB is a follow-on connected slice rather than a replacement for the fixture baseline | Codex with Zack Roland |
