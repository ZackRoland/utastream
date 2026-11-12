# Media Import Increment 7 Acceptance

**Status:** Complete — pending owner review  
**Date:** 2026-11-11  
**Scope:** YouTube URL validation and official visible-player adapter

## Delivered

- Strict parsing for supported `youtube.com`, mobile/music YouTube, Shorts,
  Live, Embed, and `youtu.be` URL shapes.
- HTTPS-only input, exact host allowlisting, 11-character video-ID validation,
  and removal of timestamps, share tokens, playlists, and other URL parameters
  from the normalized stored reference.
- Lazy loading of the official IFrame Player API after explicit user action,
  with a bounded ten-second script timeout and cleanup on replacement/unmount.
- An unobscured player viewport of at least 200×200 with YouTube controls,
  keyboard behavior, branding, inline playback, and the application origin.
- Duration and capability facts returned as an application-owned source probe;
  iframe markup and provider player objects never enter shared state.
- Deterministic recovery for invalid input, API load failure, HTML5 playback
  failure, removed/private video, non-embeddable video, and missing client
  identity/referrer.
- Shared source confirmation and replacement states that explicitly preserve
  the future source-neutral library identity.

## Current official requirements checked

Implementation was checked on 2026-11-11 against the official
[IFrame API reference](https://developers.google.com/youtube/iframe_api_reference),
[player parameter reference](https://developers.google.com/youtube/player_parameters),
and [required minimum functionality](https://developers.google.com/youtube/terms/required-minimum-functionality).

The implementation therefore:

1. Keeps the player viewport at or above 200×200.
2. Leaves controls and branding visible and unobscured.
3. Supplies `origin` whenever JavaScript player control is enabled.
4. Does not use deprecated `modestbranding` or removed parameters.
5. Maps documented errors 100, 101, 150, and 153 to recoverable states.
6. Does not autoplay, download, proxy, transcribe, fingerprint, or copy media.

## Acceptance evidence

Automated tests verify supported and rejected URL forms, normalized references,
player construction parameters, duration probing, cleanup, capability facts,
provider error mapping, replacement, and absence of iframe markup from the
shared state. Provider tests use deterministic injected players and perform no
live YouTube request.

## Deferred by design

- No YouTube Data API key or metadata call is introduced. The initial permitted
  probe is the validated reference, player availability, and player duration.
- Source persistence and retrieval after restart remain in Increment 9.
- Recording/lyric candidate normalization and confirmation begin in Increment
  8; confirming this playback reference does not yet create a library track.
- Increment 6 remains unstarted. The accepted sequencing rules allow the two
  source adapters to be implemented and reviewed independently.
- Live provider verification requires explicit configuration and consent because
  loading the embedded player shares request/device data with YouTube.
