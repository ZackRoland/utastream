# ADR-0009: Model Library Tracks Independently from Playback Sources

- **Status:** Accepted
- **Date:** 2026-11-10
- **Decision owners:** Zack Roland
- **Related documents:** [ADR-0002](./0002-start-with-a-modular-monolith-and-vertical-slices.md), [ADR-0007](./0007-use-browser-first-provider-based-media-and-lyrics.md), [ADR-0008](./0008-identify-tracks-with-metadata-confirmation-and-fingerprinting.md), [initial architecture](../architecture/initial-architecture.md)
- **Supersedes:** N/A
- **Superseded by:** N/A

## Context

UtaStream intends to let a listener add music through either a user-selected
local file or a user-supplied YouTube URL. Both routes should lead to the same
library, lyric-confirmation, explanation, and saved-learning experience. If
the application treats a YouTube video and a local file as unrelated library
items, the same recording can be duplicated and learning history can become
tied to a provider that may later be unavailable.

The two sources cannot be made behaviorally identical. A YouTube video must
play through the official visible player and can be removed or restricted. A
local file can play through a browser media element but normally remains on
one device and may require reselection in a later session. A future licensed
provider will introduce another capability set.

Lyrics are the central learning asset, but timing cannot be normalized solely
at the composition level. Studio recordings, music videos, live performances,
covers, remixes, and shortened edits may share words while requiring different
timings or lyric documents. The architecture must reuse confirmed lyric
content without silently applying timings to a different performance.

Broad server upload of user media remains deferred. Supporting local file
selection does not itself authorize storing media bytes, and supporting a
YouTube URL does not authorize storing arbitrary embed markup or copying the
provider media.

## Decision Drivers

- Offer YouTube and local-file choices without creating parallel products.
- Keep personal-library and learning identity stable when a source changes.
- Avoid duplicate tracks when the same recording is added from two sources.
- Preserve provider-specific playback requirements and capabilities.
- Reuse confirmed lyrics while protecting source-specific synchronization.
- Keep local media on the device unless a later upload decision is accepted.
- Treat source loss, local-file reselection, and lyric mismatch as normal,
  recoverable states.
- Preserve a path to licensed playback and lyric providers.

## Decision

UtaStream will model a personal-library item as a relationship between a user
and a canonical UtaStream `Track`. A `Track` may have multiple replaceable
`PlaybackSource` records. The library item does not become a YouTube item or a
local-file item merely because one of those sources was used during import.

At minimum, the conceptual model distinguishes:

```text
LibraryItem
  user identity
  UtaStream track ID
  optional preferred playback-source ID

Track
  stable UtaStream identity
  confirmed recording metadata

PlaybackSource
  UtaStream source ID
  UtaStream track ID
  source kind and source-specific reference
  original source metadata and duration
  availability and capability facts

LyricDocument
  UtaStream lyric-document ID and version
  language, timed segments, provenance, and rights capabilities

PlaybackLyricBinding
  playback-source ID
  lyric-document ID and version
  match confidence and matching-policy version
  confirmed-by-user fact and timestamp
  timing offset and relevant duration difference
```

A saved learning item continues to reference the UtaStream track, versioned
lyric document, segment, selected-text snapshot, and selection kind. Its
identity is not owned by the active playback provider. The playback source in
use when an item was saved may be retained as optional provenance, but changing
or replacing that source must not invalidate the learning record.

### Shared import pipeline

YouTube and local-file entry points will use one application-owned import
pipeline:

```text
Choose source
  -> inspect source through its adapter
  -> preserve original metadata and duration
  -> create normalized search metadata
  -> find or create a canonical track candidate
  -> query and rank lyric candidates
  -> confirm recording, lyrics, and timing
  -> attach the playback source to the track
  -> add or reuse the user's library item
```

Source adapters return UtaStream-owned probe and capability types. Metadata
normalization, candidate scoring, confirmation, canonical identity, lyric
versioning, and library persistence remain shared application behavior rather
than provider-specific UI logic.

The implementation may deliver the adapters incrementally, but the contracts
and persistence model must support both source kinds before either becomes the
permanent library model.

### Playback-source behavior

The initial source kinds are:

- `fixture` for deterministic, rights-documented application media;
- `local-file` for a user-selected file played by a browser media element;
- `youtube` for a user-supplied URL played through the official visible IFrame
  Player;
- a future licensed provider without a canonical-model rewrite.

Each adapter must expose the smallest shared playback-session behavior needed
by the application: load, play, pause, seek where supported, current time,
duration, status, and cleanup. Differences are represented as capabilities,
not hidden behind false equivalence. Capabilities may include whether the
source requires a visible provider player, supports seeking or rate changes,
and can be reopened on another device.

The web client owns the live playback session. Opening lyrics, explanations,
or library controls must not recreate that session or replace the active media
element or provider player.

### YouTube source storage

For a YouTube source, UtaStream stores a validated provider video ID,
normalized source URL, permitted metadata, availability state, and provider
provenance. It does not store user-supplied iframe HTML. The client constructs
the official visible player from the validated provider ID whenever the source
is used.

The adapter remains subject to ADR-0007: it must not download, proxy, separate,
fingerprint, transcribe, hide, or obscure YouTube media. If the source becomes
private, deleted, restricted, or non-embeddable, the library item and learning
history remain available and another source may be attached to the track.

### Local-file source storage

For a local-file source, UtaStream reads available metadata and duration in the
browser and plays the file without transmitting its bytes during the initial
path. Server-authoritative records may retain the confirmed track identity,
source metadata, lyric association, and library membership, but they must not
pretend that the server can reopen a device-local file.

A client may retain a device-local file handle or locator where browser support
and user permission allow it. That locator is device-scoped, revocable, and
not a portable source of truth. When it is unavailable, the library entry shows
an explicit `local file required` state and lets the user reselect or replace
the source.

Uploading local audio bytes to application storage is outside this decision.
It requires a separate accepted decision covering permission, privacy,
malware and abuse handling, quotas, retention, deletion, delivery cost, and
takedown behavior.

### Lyric normalization and timing

Provider lyric payloads and original text remain immutable provenance. UtaStream
may create a normalized, versioned `LyricDocument` with stable timed segments,
translations, and selectable annotations, but normalization does not erase or
overwrite its source.

A `PlaybackLyricBinding` confirms that a lyric-document version is suitable for
a particular playback source. It records the matching result and timing offset.
The same lyric document may be reused across sources only after confirmation.
A materially different performance or timing requires another binding, offset,
or lyric-document version rather than silently changing historical learning
context.

### User guidance

The source-selection interface will explain the tradeoffs before import:

- YouTube is the convenient, reference-based option and may be reusable across
  devices, but the official visible player and provider availability apply.
- A local file offers direct browser-audio playback and avoids a playback
  provider, but remains device-dependent and may need to be selected again.

Both choices lead to the same confirmation and learning experience. The UI must
not imply that selecting a local file uploads it or that submitting a YouTube
URL transfers rights to UtaStream.

### What this decision does not mean

- Every source exposes identical playback controls or availability.
- A matching title means two editions are the same recording.
- Lyric text similarity proves that one timing applies to every source.
- Local files are uploaded to UtaStream by default.
- Arbitrary iframe markup is accepted or persisted.
- Provider IDs replace UtaStream track or lyric-document identities.
- Supporting both entry points requires implementing both in one large change.

## Considered Options

### Option 1: Canonical library track with multiple playback sources — chosen

Store one library relationship to a stable UtaStream track and attach
replaceable, capability-aware playback sources.

**Advantages**

- Preserves library and learning history when a source changes or disappears.
- Allows local files and YouTube to share import, lyric, and learning behavior.
- Avoids duplicate library entries for the same confirmed recording.
- Supports future licensed providers without changing domain identity.
- Makes provider availability and device-local limitations explicit.

**Disadvantages**

- Requires source matching, merging, replacement, and preference behavior.
- Introduces a source-to-lyric timing binding in addition to track identity.
- Needs capability-aware UI rather than one assumed player feature set.

### Option 2: Store separate library items for each source

Treat a YouTube video and a local file as unrelated user-library records even
when they represent the same recording.

**Advantages**

- Simplest source-specific persistence and playback lookup.
- Avoids an initial merge or attachment workflow.

**Disadvantages**

- Duplicates tracks, lyrics, saves, and user organization.
- Ties learning history to a source that may disappear.
- Makes switching providers appear to be adding a different song.
- Pushes reconciliation into every downstream feature.

### Option 3: Upload every source into UtaStream-controlled storage

Convert every import into an application-hosted media asset and use one media
player.

**Advantages**

- Uniform playback behavior and cross-device availability.
- Direct control over seeking, timing, and media availability.

**Disadvantages**

- Creates licensing, privacy, storage, egress, abuse, security, moderation, and
  deletion obligations that the project has not accepted.
- Conflicts with the YouTube provider boundary and the cost-aware strategy.
- Treats a uniform player as more important than lawful, replaceable sources.

### Option 4: Make lyric content the only library identity

Store a lyric work as the library item and treat every recording as merely a
playback attachment.

**Advantages**

- Centers the learning asset and could group covers of the same composition.
- Encourages reuse of translation and annotation work.

**Disadvantages**

- Conflates recordings whose words, structure, language, or timing differ.
- Makes ordinary song-library metadata and playback selection ambiguous.
- Does not remove the need for recording-specific identity and timing.

## Rationale

Users think of adding a song to a personal library, not of permanently choosing
one technical provider. A stable UtaStream track identity reflects that mental
model while keeping media access replaceable. Separating playback sources from
the library also contains provider failures and device-local limitations at the
correct boundary.

Lyrics remain central without becoming an unsafe merge key. Versioned lyric
documents preserve provenance and learning context, while explicit
source-to-lyric bindings acknowledge that synchronization belongs to a
particular recording or performance. This provides shared behavior without
erasing the material differences between sources.

## Consequences

### Positive

- Users may choose the most convenient source without entering a different
  learning system.
- One library item can survive YouTube removal or local-file unavailability.
- Confirmed lyrics, annotations, and learning records remain stable across
  source replacement.
- Provider-specific code stays behind adapters and capability contracts.
- A future licensed provider can attach to existing tracks.

### Negative

- Import now needs track reuse, source attachment, confirmation, and correction
  states.
- Local-file entries may be present but temporarily unplayable until the file
  is reselected.
- Timing must be validated for each materially different source.
- Source preference, availability, and replacement add persistence and UI work.

### Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Different editions are incorrectly merged | Medium | High | Apply ADR-0008 scoring, preserve qualifiers and duration, and require first-import confirmation. |
| One lyric timing is reused for a different performance | High | High | Require a source-to-lyric binding with confirmation, duration comparison, and explicit offset or new document version. |
| A local library entry cannot reopen its media | High | Medium | Mark local locators device-scoped, expose `local file required`, and support reselection or source replacement. |
| A YouTube source becomes unavailable | High | Medium | Preserve track and learning identity independently and allow another source to be attached. |
| Arbitrary embed markup creates an injection path | Low | High | Accept allowlisted URLs, store validated provider IDs, and construct the official player internally. |
| A shared adapter hides important provider differences | Medium | Medium | Keep the common playback contract small and expose explicit capabilities and provider states. |
| Users assume a local file was uploaded | Medium | Medium | Explain source behavior before selection and show device-local status in the library. |

## Adoption Plan

1. Define UtaStream-owned `Track`, `LibraryItem`, `PlaybackSource`, source probe,
   capability, `LyricDocument`, and `PlaybackLyricBinding` contracts.
2. Replace the fixture timer with one persistent browser media session backed
   by a rights-documented fixture source.
3. Build one source-selection and explanation screen for YouTube and local-file
   choices.
4. Implement the local-file adapter without transmitting audio bytes.
5. Implement the official visible YouTube adapter without accepting iframe
   markup or extracting provider media.
6. Apply the shared metadata normalization, ADR-0008 candidate scoring, lyric
   lookup, and confirmation workflow to both sources.
7. Add FastAPI and PostgreSQL persistence for canonical tracks, playback-source
   references, library membership, confirmed lyric bindings, and preferences.
8. Add unavailable-source, local-file-reselection, source-replacement, timing
   correction, and duplicate-merge states.
9. Add adapter conformance, deterministic provider failure, responsive browser,
   continuity, and cross-source learning-history tests.

## Validation

This decision is working when:

- Importing the same confirmed recording through YouTube and a local file
  produces one library item with two playback sources rather than duplicates.
- A user can choose or replace a playback source without losing saved learning
  items or confirmed lyric history.
- A validated YouTube video ID reconstructs the official visible player without
  stored iframe markup or copied media.
- A local file plays without its bytes being transmitted and fails later with
  an explicit reselection state rather than a broken library entry.
- Different recordings or performances do not silently share lyric timing.
- Both sources pass the same metadata, lyric-candidate, confirmation,
  explanation, save, and playback-continuity acceptance scenarios.
- The source-selection guidance accurately communicates convenience, provider,
  privacy, device, and availability tradeoffs.

## Revisit Triggers

Reconsider this decision if:

- A licensed provider supplies authoritative cross-source recording identity
  and playback that materially simplifies the model.
- Browser support makes durable local-file reopening either reliable across the
  supported matrix or impractical enough to remove.
- User research shows that source replacement and merged track identity are
  more confusing than separate entries.
- Rights and funding make application-hosted user media an approved product
  capability.
- Lyric reuse across recordings proves too unreliable to justify shared lyric
  documents.

## References

- [ADR-0007: Use browser-first provider-based media and lyrics](./0007-use-browser-first-provider-based-media-and-lyrics.md)
- [ADR-0008: Identify tracks with metadata, confirmation, and deferred fingerprinting](./0008-identify-tracks-with-metadata-confirmation-and-fingerprinting.md)
- [UtaStream initial architecture](../architecture/initial-architecture.md)

## Change History

| Date | Change | Author |
| --- | --- | --- |
| 2026-11-10 | Accepted source-neutral library identity, shared import pipeline, and source-specific lyric timing bindings | Codex with Zack Roland |
