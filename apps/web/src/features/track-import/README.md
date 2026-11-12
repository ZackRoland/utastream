# Track import feature

This feature owns the shared client lifecycle for adding a playback source:
choose a source, review rights/capability guidance, hand the source-specific
work to an adapter, confirm normalized metadata and lyrics, then attach the
source to a canonical library track.

The reducer deliberately uses UtaStream-owned source kinds and steps. Local
file objects, object URLs, YouTube player objects, provider payloads, and iframe
markup do not enter the shared state machine. Each adapter returns a common,
serializable probe result.

The YouTube adapter validates supported URL forms, loads the official visible
IFrame player only after an explicit user action, and returns normalized source
facts. It never returns a player object or iframe markup to shared state. Live
provider calls are not used in automated tests.

The local-file adapter validates browser-selected audio, creates a temporary
object URL for metadata probing and preview playback, permits title and artist
correction, and revokes the URL on replacement or unmount. It returns file
metadata but never the `File`, its bytes, or the object URL. Shared state marks
that source `local_file_required` because it cannot be reopened from server
metadata.

Neither adapter may pretend that a canonical track was persisted before the
integrated persistence increment exists.
