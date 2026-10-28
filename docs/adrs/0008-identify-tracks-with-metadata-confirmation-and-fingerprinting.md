# ADR-0008: Identify Tracks with Metadata, Confirmation, and Deferred Fingerprinting

- **Status:** Accepted
- **Date:** 2026-10-27
- **Decision owners:** Zack Roland
- **Related documents:** [ADR-0007](./0007-use-browser-first-provider-based-media-and-lyrics.md), [ADR-0003](./0003-use-cost-aware-evolutionary-infrastructure.md), [initial architecture](../architecture/initial-architecture.md)
- **Supersedes:** N/A
- **Superseded by:** N/A

## Context

UtaStream must associate a local audio file or YouTube video with the correct
canonical recording and lyric document. Most audio formats can contain title,
artist, album, duration, artwork, and sometimes identifiers such as ISRC,
MusicBrainz Recording ID, or AcoustID. Those tags are optional and often
missing, inconsistent, or polluted by edition and presentation text.

YouTube titles are presentation-oriented rather than canonical metadata. A
single song may have studio, live, acoustic, cover, remix, sped-up, shortened,
or music-video versions with different duration and lyric timing. Attaching the
wrong timed lyric would undermine both the listening experience and the saved
learning context.

LRCLIB requires track title and artist for its direct lookup and recommends
album and duration. Duration is a strong discriminator; its documented direct
match normally requires a result within approximately two seconds.

Acoustic fingerprinting can identify poorly tagged local files, but it adds a
WebAssembly or native processing dependency, an external AcoustID lookup, and
privacy and failure states. It cannot be used on YouTube content under the
provider boundary in ADR-0007.

## Decision Drivers

- Correctly associate lyrics with the actual recording or performance.
- Avoid uploading a user's local audio solely for identification.
- Keep the first implementation small and free of unnecessary dependencies.
- Make ambiguity visible and correctable.
- Support Japanese, romanized, and presentation-heavy metadata.
- Retain stable canonical identities after the user confirms a match.
- Leave a clear path for identifying missing or damaged tags.

## Decision

UtaStream will use a **metadata-first, confidence-scored, user-confirmed track
identification pipeline**.

The initial implementation will:

1. Read embedded local-file metadata and media duration in the browser, or read
   permitted YouTube video metadata through the provider adapter.
2. Preserve the source values and create separately normalized search values.
3. Query the lyric provider using title, artist, optional album, and duration.
4. Rank candidates using explicit, testable similarity signals.
5. Preselect strong candidates but require confirmation before permanently
   associating a lyric record on first import.
6. Let the user reject, search, or manually correct metadata when confidence is
   insufficient.
7. Store the confirmed canonical identity, provider record, confidence, and
   confirmation fact so routine playback does not repeat discovery.

Chromaprint plus AcoustID will be a **deferred fallback** for local files whose
metadata cannot produce a credible match. It will be added only after observed
imports justify the dependency. Fingerprint calculation must occur locally;
only the compact fingerprint and duration may be sent for lookup. YouTube
audio will not be fingerprinted, downloaded, or transcribed.

### Source metadata

The import boundary should recognize, where available:

- title;
- artist and album artist;
- album;
- duration;
- track and disc number;
- ISRC;
- MusicBrainz recording, release, artist, and work identifiers;
- AcoustID and an existing AcoustID fingerprint;
- artwork reference and original filename.

Absence of a field is a normal state. Filename parsing is a fallback hint, not
canonical truth.

### Normalization

Normalization may account for:

- Unicode normalization and Japanese full-width/half-width variants;
- whitespace, punctuation, capitalization, and artist separators;
- `feat.`, `ft.`, and featured-artist variants;
- presentation phrases such as `Official MV`, `Music Video`, or `歌ってみた`;
- edition qualifiers such as live, acoustic, remix, remaster, instrumental,
  anime edit, sped-up, or shortened versions.

Normalization must not overwrite the source metadata. Qualifiers that may
identify a materially different performance remain available as ranking and
warning signals.

### Candidate scoring

The first scoring policy will use a documented weighted model, initially:

| Signal | Initial weight |
| --- | ---: |
| Normalized title similarity | 35 |
| Normalized artist similarity | 30 |
| Duration agreement | 25 |
| Album similarity | 10 |

Weights and thresholds are configuration or versioned policy, not scattered UI
constants. A reasonable initial interpretation is:

- `90-100`: strong candidate that may be preselected;
- `70-89`: ambiguous; show the best candidates;
- below `70`: require manual search or corrected metadata.

These values are starting hypotheses and must be calibrated against test data.
No score silently establishes a permanent association on first import.

Duration comparison must distinguish an approximately matching recording from
a clearly different performance. Covers, live versions, remixes, and videos
with long intros require an explicit warning or manual timing offset even when
the underlying composition matches.

### Canonical identity

A confirmed association will retain, conceptually:

```text
TrackIdentity
  UtaStream track ID
  source type and source reference
  original and normalized metadata
  duration
  ISRC / MusicBrainz Recording ID / AcoustID when known
  lyrics provider and provider record ID
  matching-policy version and confidence
  confirmed-by-user flag and confirmation timestamp
  selected timing offset
```

The UtaStream track ID remains primary. Provider IDs are external references,
not domain identity. A learning record references the UtaStream track and a
versioned lyric document so a later provider correction does not silently
rewrite historical context.

### Failure and correction behavior

- Playback remains available when identification or lyric lookup fails.
- A user can correct title, artist, album, chosen candidate, and timing offset.
- Provider `404`, `429`, overload, and timeout responses are distinguishable.
- Rejection of a candidate is retained for the active import so it is not
  immediately suggested again.
- A corrected association creates or selects a new lyric-document version
  rather than mutating saved learning context invisibly.
- Instrumental and no-lyrics outcomes are valid results.

### What this decision does not mean

- Embedded metadata is always trustworthy.
- Duration alone proves that two recordings are identical.
- A MusicBrainz or AcoustID match proves lyric licensing.
- A filename should be persisted as the canonical title without confirmation.
- UtaStream will fingerprint YouTube or other provider-controlled streams.
- Chromaprint and AcoustID must be implemented before the walking skeleton or
  first connected experiment.

## Considered Options

### Option 1: Metadata-first scoring, confirmation, and deferred fingerprinting — chosen

Use available tags and duration first; make uncertainty user-visible; add
fingerprinting only for demonstrated failure cases.

**Advantages**

- Smallest useful implementation and no audio upload.
- Works naturally with LRCLIB's lookup contract.
- Gives the user control over ambiguous editions and performances.
- Leaves a reliable fallback path for untagged local files.

**Disadvantages**

- Requires a confirmation interaction.
- Metadata normalization and scoring require calibration.
- Poor tags may fail until fingerprinting is implemented.

### Option 2: Trust embedded tags and take the first lyric result

Use the file's title and artist without candidate scoring or confirmation.

**Advantages**

- Very small implementation.
- Fast when tags and provider data are perfect.

**Disadvantages**

- Silently attaches incorrect lyrics to common editions and performances.
- Pollutes saved learning context.
- Fails badly for damaged, localized, or presentation-heavy metadata.

### Option 3: Fingerprint every local file immediately

Run Chromaprint for each import and resolve through AcoustID/MusicBrainz.

**Advantages**

- Identifies many files with missing or incorrect tags.
- Supplies stable recording metadata when a database match exists.

**Disadvantages**

- Adds processing, API registration, rate limiting, privacy disclosure, and
  another external dependency before evidence shows it is needed.
- May still return multiple releases or fail on obscure recordings.
- Does not solve YouTube identification.

### Option 4: Require users to enter all metadata manually

Ask for title, artist, album, and lyric selection on every import.

**Advantages**

- Simple backend behavior and explicit user intent.

**Disadvantages**

- Creates unnecessary friction for properly tagged files.
- Encourages inconsistent spellings and duplicate canonical records.

## Rationale

Metadata and duration solve the common case at very low cost. Explicit
confirmation prevents an optimization from becoming a correctness failure.
Deferring fingerprinting follows ADR-0003: the architecture preserves the
upgrade path, but the project adds the dependency only when real imports show
that the simpler path is inadequate.

## Consequences

### Positive

- Local audio can remain on the device during ordinary identification.
- Incorrect lyric attachment becomes visible and recoverable.
- Confirmed provider matches can be reused without repeated search calls.
- Stable identifiers and versioned policy make matching behavior testable.
- Fingerprinting remains available for the difficult case without blocking the
  first connected slice.

### Negative

- The import flow needs a candidate-confirmation screen.
- Japanese metadata normalization requires careful tests.
- A user may occasionally need to correct metadata or timing manually.
- Adding fingerprinting later will require a new privacy and dependency review.

### Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| High score selects a different edition | Medium | High | First-import confirmation, edition warnings, duration comparison, and timing-offset preview. |
| Japanese normalization merges distinct titles | Low | High | Preserve originals, keep normalization conservative, and test known collisions. |
| Provider duration is inaccurate | Medium | Medium | Treat duration as one weighted signal and expose candidate details. |
| Duplicate tracks are created from multiple sources | Medium | Medium | Retain stable recording identifiers when available and add explicit merge behavior later. |
| Fingerprinting exposes more data than expected | Low | Medium | Compute locally, disclose the lookup, transmit only fingerprint plus duration, and never upload the source audio for identification. |
| Matching policy changes historical associations | Medium | Medium | Store policy version and confirmed provider record; rematch only through an explicit migration or user action. |

## Adoption Plan

1. Define the `TrackIdentity`, source metadata, candidate, and confirmation
   contracts in the catalog module.
2. Read tags and duration from fixture and local-file sources without uploading
   local audio.
3. Normalize source-specific metadata while preserving original values.
4. Implement LRCLIB candidate lookup and versioned scoring.
5. Build the confirmation, correction, no-result, and timing-offset states.
6. Persist the confirmed association and reuse it on later sessions.
7. Assemble a small evaluation set covering Japanese titles, romanization,
   featured artists, official videos, live versions, covers, and long intros.
8. Measure failure and correction rates before implementing Chromaprint and
   AcoustID.
9. If fingerprinting is justified, record its dependency, privacy disclosure,
   rate limits, and failure behavior before enabling it.

## Validation

This decision is working when:

- Correctly tagged local files normally produce the intended candidate.
- Original Japanese metadata remains intact after normalization.
- Strong, ambiguous, missing, and provider-failure states have deterministic
  tests.
- A user can reject an incorrect candidate and persist the correct association.
- Studio, live, remix, cover, and long-intro examples do not silently share
  timing without review.
- Subsequent playback uses the confirmed lyric record without a new search.
- No local audio bytes are transmitted during the initial metadata path.
- Observed failure rates determine whether fingerprinting is worth adding.

## Revisit Triggers

Reconsider this decision if:

- A material share of local files lacks usable metadata.
- Manual correction becomes a significant source of abandonment.
- LRCLIB adds stable recording identifiers that simplify matching.
- A licensed provider supplies an authoritative cross-provider identifier.
- Browser metadata extraction is inconsistent on supported platforms.
- Privacy or provider-policy changes make fingerprint lookup inappropriate.

## References

- [LRCLIB API documentation](https://lrclib.net/docs)
- [AcoustID](https://acoustid.org/)
- [AcoustID web service](https://acoustid.org/webservice)
- [MusicBrainz fingerprinting](https://musicbrainz.org/doc/Fingerprinting)
- [MusicBrainz Picard tag mapping](https://picard-docs.musicbrainz.org/en/latest/appendices/tag_mapping.html)
- [MusicBrainz Picard basic tags](https://picard-docs.musicbrainz.org/en/v3.0/variables/tags_basic.html)

## Change History

| Date | Change | Author |
| --- | --- | --- |
| 2026-10-27 | Accepted metadata-first identification, confirmation, and deferred fingerprinting strategy | Codex with Zack Roland |
