# Track import feature

This feature owns the shared client lifecycle for adding a playback source:
choose a source, review rights/capability guidance, hand the source-specific
work to an adapter, confirm normalized metadata and lyrics, then attach the
source to a canonical library track.

The reducer deliberately uses UtaStream-owned source kinds and steps. Local
file inputs, object URLs, YouTube player objects, provider payloads, and iframe
markup do not enter the shared state machine. Each adapter will return a common
probe result in its own increment.

The current flow stops at the adapter handoff. It must not pretend that a file
was selected, a YouTube URL was validated, or a track was persisted before the
corresponding implementation exists.
