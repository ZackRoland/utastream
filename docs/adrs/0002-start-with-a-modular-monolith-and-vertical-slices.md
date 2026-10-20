# ADR-0002: Start with a Modular Monolith and Vertical Slices

- **Status:** Proposed
- **Date:** 2026-10-19
- **Decision owners:** Zack Roland
- **Related documents:** [Project manifesto](./manifesto-v1.md), [ADR-0001](./0001-use-figma-as-design-source-of-truth.md), [mobile core flow](../design/mobile-core-flow-v1.md), [initial architecture](../architecture/initial-architecture.md)
- **Supersedes:** N/A
- **Superseded by:** N/A

## Context

The Figma Make prototype and mobile design brief establish a useful product
surface: music discovery and collections, continuous playback, synchronized
lyrics, contextual language explanations, saving material to decks, review,
and profile preferences. The prototype also separates playback, lyrics,
learning continuity, and profile navigation in its source structure. These are
useful domain clues, but the prototype is not the production architecture.

UtaStream is currently a small project whose highest-risk assumptions concern
the listening-to-learning experience, media and lyric rights, source
ingestion, lyric timing and explanation quality. Operational complexity is not
yet a differentiator. The architecture must let the project validate a real
end-to-end experience without committing early to independently deployed
services or a specific music, transcription, translation, or AI vendor.

Some work is naturally asynchronous. Importing a user-provided track,
extracting metadata, aligning lyrics, and preparing language annotations may
take longer than an interactive request. Playback and lyric-following, by
contrast, require responsive reads and stable continuity on the client.

## Decision Drivers

- Deliver one useful listening-to-learning journey as early as possible.
- Keep playback responsive while longer content-processing work runs safely.
- Preserve clear ownership of music, lyrics, learning, and user-library rules.
- Avoid distributed-system overhead while the product and team are small.
- Make external content and AI providers replaceable.
- Support reliable retries, observability, privacy, and rights-aware deletion.
- Allow later extraction of a service only when measurements justify it.

## Decision

UtaStream will begin as a **modular monolith organized by product capability**,
delivered through end-to-end vertical slices.

The initial runtime shape will contain:

1. A mobile-first web client responsible for presentation, accessible
   interaction, local playback controls, and short-lived UI state.
2. One application backend exposing the product API and enforcing business,
   authorization, provenance, and rights rules.
3. One background worker deployment using the same application modules for
   long-running and retryable jobs.
4. One relational database as the authoritative store for users, catalog
   metadata, lyric timing, learning records, job state, and provenance.
5. Object storage for permitted user media, artwork, and derived artifacts;
   large binaries will not be stored in the relational database.

The application will be partitioned into modules with explicit public
interfaces:

- **Identity and preferences** — accounts, language display, accessibility,
  and playback preferences.
- **Catalog and library** — tracks, artists, albums, collections, imports, and
  saved music.
- **Playback** — playable-source resolution, queue state, and playback
  continuity. The browser remains responsible for actual media rendering.
- **Lyrics** — lyric documents, timed segments, readings, translations, and
  alignment versions.
- **Learning** — contextual explanations, saved expressions, decks, cards,
  and review scheduling.
- **Content processing** — import, metadata, lyric preparation, alignment, and
  annotation jobs.

Cross-module access must go through a module's public application interface,
not through another module's internal repository or tables. Initially the
modules may share a process, repository, database server, and transaction
boundary. Module ownership should still be visible in code and database
naming or schemas.

External systems—including media sources, object storage, dictionaries,
translation, transcription, and language-model providers—will be accessed
through small ports owned by the consuming module. Provider-specific payloads
must not become the canonical domain model.

### What this means in practice

- Work is planned as vertical slices such as “play a seeded track” or “save a
  lyric expression,” not as complete frontend and backend layers built in
  isolation.
- The first walking skeleton uses seeded or explicitly permitted media and
  lyrics; broad catalog acquisition is not a prerequisite.
- Long-running operations create persistent jobs with idempotency keys,
  observable status, bounded retries, and failure details suitable for users
  and operators.
- API contracts use stable UtaStream identifiers and include content source,
  rights/provenance, processing status, and version where those facts affect
  user trust or reproducibility.
- Playback position and transient panel state can remain client-side; saved
  library, learning, and processing state is server-authoritative.
- A module is extracted into a separate service only after a documented need
  such as independent scaling, isolation, ownership, or a conflicting runtime
  requirement.

### What this decision does not mean

- Every module must have a separate package, database, or deployment on day
  one.
- The background worker is a microservice with an independent domain model.
- A particular web framework, backend language, queue, cloud, or AI provider
  has been selected.
- UtaStream is authorized to download, retain, transform, or redistribute any
  media or lyrics merely because the architecture can do so.
- Offline playback, native applications, social features, and a public catalog
  API are part of the first release.

## Considered Options

### Option 1: Modular monolith with an asynchronous worker — chosen

Keep one coherent application and data model while isolating capabilities in
code. Run slow processing through a durable job boundary.

**Advantages**

- Fastest route to transactional end-to-end product slices.
- Clearer module seams than an unstructured monolith.
- Lower deployment, debugging, and local-development cost than microservices.
- Provides a natural place for slow and retryable content preparation.
- Leaves service extraction possible when evidence appears.

**Disadvantages**

- Module boundaries require discipline because the database and process are
  shared.
- One application release can affect several capabilities.
- Heavy processing may eventually require stronger workload isolation.

### Option 2: Microservices from the beginning

Deploy playback, catalog, lyrics, learning, and processing as separate
services with service-owned storage.

**Advantages**

- Strong operational boundaries and independent scaling.
- Failures and deployments can be isolated by capability.

**Disadvantages**

- Adds networking, authentication, tracing, deployment, contract, and data
  consistency work before product-market risk is reduced.
- Makes end-to-end changes and local development slower for a small team.
- Encourages speculative boundaries that may not match the learned domain.

### Option 3: Client-only application backed directly by third-party services

Put most logic in the web client and call storage, music, and language APIs
directly.

**Advantages**

- Very small initial server footprint.
- Can produce a narrow visual demo quickly.

**Disadvantages**

- Exposes credentials or couples the client tightly to vendors.
- Makes rights enforcement, provenance, background processing, and reliable
  retries difficult.
- Duplicates business rules across clients and weakens migration options.

### Option 4: Event-driven distributed system

Model most capability changes as events consumed by independent processors.

**Advantages**

- Natural support for asynchronous enrichment and extensibility.
- Good isolation for high-volume pipelines.

**Disadvantages**

- Event versioning, ordering, replay, observability, and eventual consistency
  add substantial early complexity.
- Harder to understand and operate before throughput demands it.

## Rationale

The modular monolith minimizes accidental complexity while preserving the most
important future seams. It matches the current team and validation stage, and
it allows a single vertical slice to cross playback, lyrics, and learning in
one understandable system. A separate worker acknowledges the real latency
and reliability needs of content preparation without turning every capability
into a network boundary.

Provider ports are especially important because content availability,
licensing, language tooling, and vendor quality are unresolved. Stable domain
models and recorded provenance allow experiments without making one provider's
response format the foundation of the product.

## Consequences

### Positive

- The first prototype can use production-shaped boundaries without production-
  scale infrastructure.
- Playback and learning changes can be developed and tested end to end.
- Slow content processing does not block interactive API requests.
- Provider and storage choices remain replaceable.
- A future service extraction can follow measured pressure and an existing
  module boundary.

### Negative

- Contributors must actively prevent cross-module database coupling.
- Worker and API deployments must remain compatible during migrations.
- A shared database can conceal ownership mistakes until they are reviewed.
- The project must build basic job reliability and provenance earlier than a
  purely visual prototype would require.

### Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| The monolith becomes a collection of tightly coupled layers | Medium | High | Enforce capability modules, public interfaces, dependency tests, and module-owned migrations. |
| Processing jobs create duplicate or conflicting artifacts | Medium | High | Require idempotency keys, immutable input versions, and atomic result publication. |
| Provider output leaks into core models | Medium | Medium | Map at adapter boundaries and store raw responses only as versioned provenance when justified. |
| Shared deployment harms playback during heavy processing | Medium | High | Run workers separately, set resource limits, and measure API latency and queue depth. |
| Rights are treated as an implementation afterthought | Medium | High | Model source, permitted use, retention, attribution, and deletion with content from the first slice. |
| Premature abstractions slow delivery | Medium | Medium | Add ports at external and module boundaries; keep internal abstractions evidence-driven. |

## Adoption Plan

1. Confirm this ADR or revise its runtime and module boundaries.
2. Record stack and deployment selections in a separate ADR; do not bury them
   in this architectural-shape decision.
3. Scaffold the client, API, worker, shared contract approach, and local
   dependencies.
4. Implement a walking skeleton: load one permitted seeded track, play it,
   show timed lyrics, select an expression, and save it.
5. Add a processing job skeleton with idempotency, status, retry, and a no-op
   or fixture-backed processor.
6. Add architecture checks and an end-to-end test for the walking skeleton.
7. Expand one vertical slice at a time, beginning with the product risks rather
   than completing every module in advance.

## Validation

This decision is working when:

- A contributor can trace the walking skeleton from UI action to persisted
  state and back without crossing undocumented boundaries.
- Interactive playback and lyric reads remain responsive while a processing
  job runs or fails.
- At least one external provider can be replaced by a fixture adapter in tests.
- Retrying the same processing request does not create duplicate user-visible
  results.
- A content item can report its source and be deleted with its derived data.
- New slices normally change only their owning modules and explicit contracts.

## Revisit Triggers

Reconsider this decision if:

- Measured workload isolation cannot be achieved with separate API and worker
  deployments.
- A module needs a different runtime or release cadence that materially slows
  the rest of the application.
- Team ownership makes independent deployment more valuable than transactional
  simplicity.
- Availability objectives require isolating a capability from the rest of the
  application.
- Cross-module changes remain common, suggesting that the proposed boundary is
  wrong rather than that another service is needed.

## References

- [UtaStream mobile experience design brief](../design/mobile-core-flow-v1.md)
- [Initial architecture](../architecture/initial-architecture.md)
- [ADR-0001: Use Figma as the design source of truth](./0001-use-figma-as-design-source-of-truth.md)

## Change History

| Date | Change | Author |
| --- | --- | --- |
| 2026-10-19 | Initial proposal based on the core prototype and current project stage | Codex with Zack Roland |
