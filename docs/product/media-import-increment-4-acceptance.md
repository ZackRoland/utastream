# Media Import Increment 4 Acceptance

**Status:** Complete — pending owner review  
**Date:** 2026-11-11  
**Scope:** Rights-documented real fixture media and browser playback

## Delivered

- A 218-second original synthetic instrumental created for UtaStream, encoded
  as a browser-compatible mono MP3, and dedicated under CC0 1.0.
- Media provenance, integrity hash, format details, and a deterministic source-
  waveform generator with no third-party samples or network dependency.
- A source-aware catalog fixture: only the track represented by this recording
  is playable; prototype cards without a permitted source are explicitly
  disabled instead of falsely reusing the recording.
- One persistent `HTMLAudioElement` whose native media events drive playback
  status, duration, current time, seeking, ending, restart, and errors.
- Preservation of the existing playback-controller boundary so future local-
  file and YouTube adapters do not own lyric or learning UI state.
- A recoverable media-error message and retry path.

## Automated acceptance evidence

The web suite verifies:

1. Media loading waits for browser events instead of advancing a React timer.
2. Metadata and time events replace expected fixture values with authoritative
   decoded-media values.
3. Seeking updates the media element and state together.
4. Native ended and error events produce explicit playback states.
5. Playing and paused state survive opening and closing lyric and explanation
   overlays without replacing the playback controller.
6. A prototype track without permitted media cannot replace the active source.
7. Lyric highlighting continues to consume the real playback position.

## Real-browser verification

The production-shaped Vite application was exercised in Chromium against
`beyond-the-night-fixture.mp3` on 2026-11-11:

- The media reached a ready state with no decoder error and began playing from
  a user track-selection gesture.
- Current time advanced from the actual media element.
- Opening synchronized lyrics and an explanation retained exactly one audio
  element and uninterrupted playback.
- Seeking the visible timeline to its end produced `ended = true`, paused the
  element, updated the UI to `3:38 / 3:38`, and changed the control to Play.
- Selecting Play restarted the same media session at the beginning.

## Deferred by design

- The fixture is instrumental test media; the Japanese lyric document is
  intentionally authored timing data for UI synchronization testing, not a
  transcription of performed vocals.
- Device-local file selection begins in Increment 6 after the shared source-
  choice experience in Increment 5.
- YouTube playback remains confined to its future official visible-player
  adapter and does not reuse this browser-audio element.
- Playwright installation and the full two-provider end-to-end suite remain in
  Increment 9; this increment uses adapter/integration tests plus a recorded
  real-browser acceptance pass.
