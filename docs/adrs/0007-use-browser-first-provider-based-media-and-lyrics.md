# ADR-0007: Use Browser-First Provider-Based Media and Lyrics

- **Status:** Accepted
- **Date:** 2026-10-27
- **Decision owners:** Zack Roland
- **Related documents:** [ADR-0002](./0002-start-with-a-modular-monolith-and-vertical-slices.md), [ADR-0003](./0003-use-cost-aware-evolutionary-infrastructure.md), [ADR-0004](./0004-use-react-fastapi-and-postgresql-as-the-baseline-stack.md), [walking skeleton](../product/walking-skeleton-v1.md), [initial architecture](../architecture/initial-architecture.md)
- **Supersedes:** N/A
- **Superseded by:** N/A

## Context

UtaStream is intended to let a learner study Japanese through songs they
actually care about. A fixture-only catalog is sufficient to prove the
listening-to-learning interaction, but it does not test the practical product
promise. Hosting commercial recordings and lyrics directly would introduce
rights, storage, delivery, moderation, and recurring-cost obligations that the
project is not currently equipped to assume.

A browser application can use an official YouTube embedded player without
copying or serving the audiovisual file. A separate community lyrics service
can provide timed lyric candidates. LRCLIB is currently a technically suitable
experiment because its API is free, CORS-enabled, supports plain and timed
lyrics, and does not require a paid account.

These facts do not create a blanket content license. YouTube's permission to
embed a video does not grant UtaStream lyric rights. LRCLIB's server code is
open source, but that does not establish that every community-contributed lyric
is licensed for every form of reuse. Noncommercial intent reduces neither the
need to follow provider terms nor all copyright risk.

The application therefore needs to distinguish a deterministic, documented
fixture path from an experimental connected path while sharing the learning
experience and application-owned domain model.

## Decision Drivers

- Let the owner build and personally use a practical favorite-song workflow.
- Demonstrate a realistic, complex integration without hosting commercial
  audio.
- Preserve a zero-recurring-cost development path.
- Retain a deterministic and rights-documented path for tests and public demos.
- Keep playback, lyrics, translation, and learning providers replaceable.
- Comply with YouTube embedded-player behavior rather than extracting media.
- Make uncertain content provenance visible rather than implying production
  licensing.
- Preserve the ability to adopt a licensed lyric or playback provider later.

## Decision

UtaStream will remain a **browser-first application** and support multiple
playback and lyric providers behind application-owned ports.

Two product modes will be implemented incrementally:

1. **Fixture/local mode** uses permitted fixture media or a user-selected local
   file. The initial walking skeleton continues to use documented fixture
   audio, lyrics, translations, and explanations.
2. **Experimental connected mode** accepts a user-supplied YouTube URL, plays
   it through the official visible YouTube IFrame Player, and attempts to match
   it with timed lyrics from LRCLIB.

Connected mode is intended for personal learning and portfolio demonstration.
It will not be described as a licensed commercial catalog. Before any broader
production or monetized use, the project must separately review the relevant
playback, lyric display, translation, annotation, caching, and excerpt-storage
permissions.

### Provider boundaries

The playback boundary will support at least these conceptual adapters:

- `FixturePlaybackProvider`
- `LocalFilePlaybackProvider`
- `YouTubeEmbedPlaybackProvider`
- a future licensed playback provider

The lyrics boundary will support at least:

- `FixtureLyricsProvider`
- `LrclibLyricsProvider`
- a future local-transcription experiment for local files only
- a future licensed lyrics provider

Provider payloads and identifiers will be mapped into UtaStream-owned types.
The canonical model must retain provider, provider record ID, attribution,
provenance, match confidence, timing type, and known usage capabilities.

### YouTube boundary rules

The YouTube adapter must:

- use the official IFrame Player API;
- keep the video player visible and large enough for its standard controls;
- preserve YouTube branding, links, controls, advertisements, and playback
  behavior;
- place UtaStream lyrics and learning controls beside or below the player, not
  over it;
- use only documented playback controls, events, metadata, and current-time
  access;
- tolerate embedding being disabled, region restrictions, removal, ads,
  autoplay blocking, and provider unavailability;
- avoid downloading, caching, proxying, separating, fingerprinting,
  transcribing, or otherwise extracting YouTube audio or video;
- avoid hidden or background YouTube playback.

The initial connected flow begins with a pasted URL. Catalog-wide YouTube
search and recommendation are deferred because they add API quota, moderation,
and product-scope concerns that are unnecessary for this experiment.

### LRCLIB boundary rules

The LRCLIB adapter must:

- identify UtaStream as required by the provider documentation;
- honor `429` responses and `Retry-After` rather than retrying aggressively;
- use bounded, sequential lookup behavior and cache confirmed provider IDs only
  where appropriate;
- treat results as candidates until the match policy in ADR-0008 accepts them;
- retain attribution and provider provenance;
- allow a lyric record to be flagged, replaced, disabled, or removed without
  changing saved learning-item identity;
- fail without preventing playback when lyrics are missing or unavailable.

UtaStream will not use a multi-source scraper that circumvents or impersonates
commercial lyric services. Open-source implementation code is not evidence of
permission to retrieve or redistribute the underlying content.

### Rights-aware lyric capabilities

A lyric source may declare capabilities such as:

- display;
- timed synchronization;
- temporary or persistent caching;
- translation;
- annotation or tokenization;
- excerpt storage;
- required attribution;
- territory or expiration restrictions.

Unknown permission is not equivalent to granted permission. Early experimental
providers may be labeled as having unknown rights status; production behavior
must be disabled unless the necessary capabilities are established.

### User-interface consequences

Connected mode will use a layout designed around the visible provider player:

- desktop places the YouTube player beside a synchronized learning panel;
- narrow screens place the player above lyrics and use a bottom sheet or
  similarly non-obscuring explanation surface;
- translation and reading controls affect the lyric panel only;
- opening and closing an explanation preserves the active playback session and
  position;
- missing lyrics, ambiguous matches, embedding failures, and timing offsets
  have explicit recoverable states.

Fixture/local mode may retain the original UtaStream player presentation
because UtaStream controls that media element.

### What this decision does not mean

- User submission of a URL transfers copyright responsibility or grants reuse
  rights to UtaStream.
- YouTube authorizes UtaStream to copy captions or lyrics into its own UI.
- LRCLIB's open-source server license licenses every lyric in its database.
- Noncommercial or portfolio use is automatically exempt from copyright or
  provider terms.
- Commercial audio will be uploaded to UtaStream object storage for the public
  demonstration.
- YouTube or LRCLIB has become an irreplaceable domain dependency.
- The fixture walking skeleton is being skipped.

## Considered Options

### Option 1: Fixture/local plus experimental YouTube and LRCLIB adapters — chosen

Maintain a rights-documented baseline while adding a practical connected path
through official embedding and a free timed-lyrics API.

**Advantages**

- Exercises the intended favorite-song workflow with no audio hosting.
- Requires no recurring music or lyric API subscription for the experiment.
- Demonstrates provider integration, synchronization, matching, responsive UI,
  provenance, and failure handling.
- Preserves deterministic tests and a provider migration path.

**Disadvantages**

- LRCLIB content rights are not established merely by API accessibility.
- A YouTube video may not match the studio recording used for lyric timing.
- Availability and provider terms can change independently.
- Connected mode requires a distinct responsive player layout.

### Option 2: Host commercial audio and lyrics directly

Store recordings and lyric documents in UtaStream-controlled infrastructure.

**Advantages**

- Full control over playback, timing, offline behavior, and visual design.
- No dependency on an embedded third-party player.

**Disadvantages**

- Creates material licensing, storage, delivery, security, moderation, and
  takedown obligations.
- Conflicts with the project's cost and dependency posture.
- Noncommercial intent does not itself authorize the use.

### Option 3: Require only local audio and local lyrics

Keep all content on the user's device and require both inputs.

**Advantages**

- Avoids UtaStream distributing the media or lyric files.
- Works without a playback-provider dependency.

**Disadvantages**

- Asking for both files creates unacceptable onboarding friction.
- Most users do not possess timed lyric files.
- Does not demonstrate the intended connected experience.

### Option 4: Adopt a paid licensed lyrics provider immediately

Use Musixmatch, LyricFind, or another commercial provider from the first
connected prototype.

**Advantages**

- Potentially clearer provenance, support, and catalog quality.
- May provide high-quality synchronized lyrics and translations.

**Disadvantages**

- Adds recurring cost before product validation or revenue.
- Public plan pricing may not include the application's exact reuse rights.
- Translation, annotation, and saved excerpts may still require negotiation.

### Option 5: Use Spotify playback plus a separate lyric provider

Use Spotify's Web Playback SDK for music and another service for lyrics.

**Advantages**

- Strong commercial catalog and playback metadata.

**Disadvantages**

- Requires Premium playback and Spotify approval for broader use.
- Spotify's lyric agreement does not transfer to UtaStream.
- Current development and extended-access constraints do not fit the project's
  early-user targets.
- Spotify content cannot be used as input to an AI or transcription model.

## Rationale

The chosen approach tests the product's defining workflow without pretending
that a free community catalog is equivalent to licensed production content.
The fixture path protects deterministic development and public demonstration;
the connected path provides the practical personal-learning experience and
complex integration work the owner wants to build.

Keeping playback and lyrics separate is essential. It lets a future licensed
lyrics provider work with local or provider playback, and it prevents one
source's restrictions from becoming the entire application's domain model.

## Consequences

### Positive

- UtaStream can test favorite-song learning without serving commercial audio.
- The connected implementation remains near zero recurring cost.
- The project demonstrates meaningful integration and failure-handling skills.
- A licensed provider can replace LRCLIB without rewriting the learning module.
- The original fixture-based experience remains stable and testable.

### Negative

- Two player layouts and several provider states must be designed and tested.
- Connected playback cannot offer all controls available to a local media
  element.
- Lyric availability, provenance, accuracy, and timing will vary.
- The experimental implementation cannot honestly be represented as a fully
  licensed commercial catalog.

### Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| LRCLIB contains a disputed or unauthorized lyric | Medium | High | Retain provenance, support disabling/flagging records, avoid catalog mirroring, and use permitted fixtures for the stable public demo. |
| YouTube blocks or removes a video | High | Medium | Treat source unavailability as normal, preserve learning data independently, and allow another source to be selected. |
| Lyrics match the song but not the performance | High | Medium | Apply ADR-0008 matching, require confirmation when ambiguous, compare duration, and support an explicit timing offset. |
| UI violates embedded-player requirements | Low | High | Keep the player visible and unobscured; test minimum size, controls, and responsive layouts. |
| Provider outage breaks the learning session | Medium | Medium | Keep playback usable, cache only confirmed identifiers and permitted artifacts, and expose retry/source replacement. |
| Experimental language is mistaken for production clearance | Medium | High | Label provider provenance and rights status; require a licensing review before production or monetization. |

## Adoption Plan

1. Complete the deterministic fixture walking skeleton before relying on live
   providers.
2. Define application-owned playback, lyrics, provenance, and capability
   contracts.
3. Build the connected-mode responsive shell around a visible YouTube embed.
4. Accept and validate one user-supplied YouTube URL without adding general
   YouTube search.
5. Implement the LRCLIB adapter with identification, throttling, timeout, and
   failure behavior.
6. Apply ADR-0008 candidate matching and explicit confirmation.
7. Add timing-offset correction for intros or minor performance differences.
8. Exercise the same explanation, save, and playback-continuity flow in both
   modes.
9. Before public expansion or monetization, review provider terms and obtain
   any licenses required for lyric display, translation, annotation, caching,
   and saved excerpts.

## Validation

This decision is working when:

- The fixture journey remains deterministic and requires no external provider.
- A user can paste an embeddable YouTube URL and play it in the official player.
- The learning panel never obscures or replaces the provider player.
- A matching LRCLIB record can follow playback with documented timing quality.
- An ambiguous or incorrect match can be rejected and replaced by the user.
- Playback remains usable when lyrics fail.
- Opening, saving from, and closing an explanation preserves playback state.
- Provider failure tests do not corrupt canonical track or learning records.
- The UI clearly identifies source and experimental status.

## Revisit Triggers

Reconsider this decision if:

- YouTube changes its embedded-player policies or blocks the required controls.
- LRCLIB removes access, changes its API materially, or proves inadequate for
  the Japanese catalog.
- The project prepares for monetization or general public distribution.
- A licensed provider becomes affordable and grants the required learning-use
  capabilities.
- Matching or timing failure makes connected mode materially frustrating.
- Provider-specific UI constraints prevent the intended learning experience.

## References

- [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference)
- [YouTube API Services Developer Policies](https://developers.google.com/youtube/terms/developer-policies)
- [YouTube Required Minimum Functionality](https://developers.google.com/youtube/terms/required-minimum-functionality)
- [LRCLIB API documentation](https://lrclib.net/docs)
- [LRCLIB source repository](https://github.com/tranxuanthang/lrclib)
- [JASRAC lyric and score distribution guidance](https://web.jasrac.or.jp/users/internet/score/)

## Change History

| Date | Change | Author |
| --- | --- | --- |
| 2026-10-27 | Accepted browser-first fixture/local and experimental YouTube plus LRCLIB strategy | Codex with Zack Roland |
