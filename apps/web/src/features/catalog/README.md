# Catalog feature

The catalog feature owns collection browsing, track metadata, seeded fixtures,
and catalog-facing view models.

## Public boundary

Consumers import from `features/catalog`, never from its internal folders. A
collection emits a `TrackId`; it does not start playback itself. The playback
feature will consume that selection in the next increment.

The seeded fixture collection remains deterministic prototype evidence. The
persisted-library surface is loaded through the application-owned API and
shows canonical tracks, attached source count, lyric version, and explicit
source availability such as `local file required`.
