# Media Import Increment 6 Acceptance

**Status:** Complete — pending owner review  
**Date:** 2026-11-11  
**Scope:** Local-file adapter

## Delivered behavior

- A listener can select a non-empty browser-supported audio file and replace
  that selection without leaving the shared add-track flow.
- The browser media element reads duration and provides preview controls from a
  temporary object URL.
- The listener can correct the title and optional artist used for matching.
- The adapter reports only serializable metadata to the shared state machine.

## Acceptance evidence

| Gate | Evidence |
| --- | --- |
| No file bytes cross the network | The adapter passes the selected `File` only to `URL.createObjectURL`; it has no fetch, request, `FileReader`, or `arrayBuffer` path. Its component test also spies on `fetch` and proves it is unused. |
| Temporary access is cleaned up | Component tests prove replacement revokes the old object URL and unmount revokes the active URL. |
| Missing access is explicit | The shared probe records `availability: local_file_required`; neither the `File` nor its `blob:` URL enters shared state. |
| Metadata can be corrected | Component tests change title and artist after duration probing and verify the normalized probe. |
| Invalid files recover locally | Empty or unsupported selections fail before an object URL is created; decode and duration failures keep Continue disabled. |
| Replacement does not define identity | The shared reducer replaces only the source probe. Canonical track and learning identity remain outside the adapter per ADR-0009. Persisted end-to-end identity is verified in Increment 9. |

## Architectural verification

This implementation follows ADR-0007 by keeping local playback browser-first
and follows ADR-0009 by treating the file as a replaceable playback source,
not a library identity. It does not broaden the project into general media
upload or server storage.

The temporary object URL exists only inside the mounted local adapter. When
the adapter advances to shared confirmation, React cleanup revokes it. The
resulting `local_file_required` state is deliberate rather than an attempt to
make a transient browser locator durable.

## Deferred by design

- Candidate track and lyric lookup is Increment 8.
- Persisting source metadata, attaching it to a canonical track, restoring the
  library after restart, and browser-level identity tests are Increment 9.
- Durable device file handles and server-side media upload remain outside this
  increment and require separate product and architecture decisions.
