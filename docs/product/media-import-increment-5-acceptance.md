# Media Import Increment 5 Acceptance

**Status:** Complete — pending owner review  
**Date:** 2026-11-11  
**Scope:** Shared source-choice experience and import lifecycle

## Delivered

- One application-owned import state machine covering closed, source choice,
  guidance review, and provider-adapter handoff states.
- A single Add Track entry point for local-file and YouTube sources.
- Plain-language how-to guidance explaining convenience, device dependence,
  player visibility, availability, reselection, and source replacement.
- Explicit rights language: local selection is not audio upload, and submitting
  a YouTube link transfers neither media nor lyric rights.
- A shared handoff boundary where later adapters return metadata before common
  confirmation, lyric matching, and persistence resume.
- Modal background isolation, Escape/close behavior, focus restoration, and a
  responsive mobile bottom-sheet/desktop-dialog layout.

## Acceptance evidence

The reducer and component suites prove:

1. Both source kinds traverse the same lifecycle states.
2. Closing clears provider-specific state rather than leaking it into the next
   attempt.
3. Local guidance states that audio bytes stay out of the upload path and that
   device-local access may require reselection.
4. YouTube guidance states that only a validated reference is stored, the
   official player remains visible, and availability can change.
5. Neither choice claims to connect its adapter before implementation exists.
6. Opening and closing Add Track retains exactly one active audio session,
   playback state, time, and focus.

The responsive browser pass verified the complete YouTube guidance and handoff
at the mobile breakpoint. It also caught and corrected an invalid spacing token;
the final panel has 24 px content padding and no horizontal overflow.

## Deferred by design

- Increment 6 supplies the local-file adapter, object-URL lifecycle, metadata
  probing, device-local recovery, and byte-transmission guard.
- Increment 7 supplies URL parsing, the official YouTube IFrame player,
  capability/availability mapping, and source replacement.
- Shared recording and lyric confirmation will consume real adapter results;
  this increment does not fabricate metadata simply to advance the UI.
- Persistence and full two-source browser acceptance remain in Increment 9.
