# Playback feature

Owns client playback state, transport controls, and playback adapters. Catalog
selection is translated into the playback `load` command by `app/`; playback
does not import catalog models or metadata.

`useFixturePlayback` is deterministic UI infrastructure, not real media. A
future browser-audio adapter should preserve the public controller semantics
while sourcing time and status from the media element.
