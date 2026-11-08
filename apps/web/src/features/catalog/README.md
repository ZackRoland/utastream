# Catalog feature

The catalog feature owns collection browsing, track metadata, seeded fixtures,
and catalog-facing view models.

## Public boundary

Consumers import from `features/catalog`, never from its internal folders. A
collection emits a `TrackId`; it does not start playback itself. The playback
feature will consume that selection in the next increment.

The current fixture content is prototype evidence. Before the walking skeleton
is complete, its media and metadata provenance must be documented as required
by `docs/product/walking-skeleton-v1.md`.
