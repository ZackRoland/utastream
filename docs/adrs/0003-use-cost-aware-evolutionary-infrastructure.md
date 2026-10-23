# ADR-0003: Use Cost-Aware Evolutionary Infrastructure

- **Status:** Proposed
- **Date:** 2026-10-22
- **Decision owners:** Zack Roland
- **Related documents:** [Project manifesto](./manifesto-v1.md), [ADR-0002](./0002-start-with-a-modular-monolith-and-vertical-slices.md), [initial architecture](../architecture/initial-architecture.md)
- **Supersedes:** N/A
- **Superseded by:** N/A

## Context

UtaStream needs enough infrastructure to validate a real listening-to-learning
experience, but it does not yet have a validated product, established usage
patterns, or defined revenue streams. Recurring hosting and provider costs can
reduce the project's ability to experiment and grow just as surely as poor
technical foundations can.

The project therefore needs to balance two risks:

1. Building for hypothetical scale and accepting cost and operational burden
   before users create that need.
2. Selecting free services so tightly coupled to one provider that growth later
   requires an application rewrite or risky data migration.

UtaStream's likely variable-cost drivers are not limited to application compute.
They include audio storage and delivery, user-provided media, background content
processing, transcription, lyric alignment, translation, language-model usage,
and potentially licensed music or lyric providers. Some of those costs grow
with listening time, some with stored content, and some with newly processed
songs.

Revenue plans and user subscription tiers are intentionally premature. This
decision addresses infrastructure capacity and operational quality, not how the
product will charge users.

## Decision Drivers

- Keep recurring infrastructure and provider spend at or near zero during
  local development and initial product validation.
- Avoid infrastructure work that does not improve the core product experiment.
- Preserve an understandable path from free capacity to greater capacity,
  reliability, and performance.
- Limit the number of required services, vendors, SDKs, and operational systems.
- Prefer open-source technology, open protocols, standard data formats, and
  exportable data.
- Prevent free-tier or provider-specific constraints from becoming product
  domain rules.
- Scale expensive workloads independently only when measurements demonstrate a
  need.
- Avoid committing to paid microservices before sustainable revenue streams are
  identified and defined.

## Decision

UtaStream will use a **cost-aware, evolutionary infrastructure strategy**.
The default posture is a local-first development environment and a minimal
hosted footprint that uses no-cost tiers where they are sufficient. Managed
free tiers may be used when they reduce operational burden, provided the
underlying technology and data remain portable.

The project will prefer increasing the capacity or quality of the existing
architecture over changing its architectural style. A paid microservice
migration requires both:

1. Evidence that a particular workload cannot meet defined capacity,
   reliability, isolation, or operational requirements economically within the
   existing modular-monolith and worker architecture.
2. An identified and defined revenue stream, funding source, or other durable
   means of supporting the additional recurring and operational cost.

Technical pressure alone may justify investigation and a migration plan, but
it does not by itself justify adopting paid microservice infrastructure.

### Infrastructure stages

| Stage | Default posture | Permitted complexity | Exit evidence |
| --- | --- | --- | --- |
| Local prototype | Local application, relational database, file/object-storage substitute, fixture providers | Only what is required to prove the end-to-end product loop | The product needs to be shared with external testers. |
| Hosted prototype | Minimal deployment using no-cost managed tiers or an equivalently low-burden host | Application API, relational database, static client, and worker only when required | A specific free-tier limit, reliability problem, or tester need becomes material. |
| Early growth | Increase capacity or service quality without changing domain boundaries | Paid capacity may be evaluated narrowly when no adequate no-cost option remains | Measurements show sustained pressure or unacceptable user impact. |
| Sustainable scale | Independently scale proven bottlenecks; add CDN, caching, or worker capacity when justified | Additional managed services or extracted services only with operational and financial justification | Revisit continuously using unit cost, reliability, and revenue evidence. |

These stages are evidence gates, not calendar milestones or user-count promises.

### Initial scale envelope

UtaStream will plan the early architecture around a path to **10,000 monthly
active users (MAU)**. It will use **1,000 MAU** as the first proof-of-scale and
infrastructure-funding review gate.

For this decision, a monthly active user is a distinct authenticated user who
performs at least one meaningful product action during a rolling 30-day period,
such as playing a track, opening synchronized lyrics, saving an expression, or
completing a review. Anonymous prototype traffic will be measured separately
until account identity is available.

The two targets have different meanings:

| Target | Meaning | Expected response |
| --- | --- | --- |
| 1,000 MAU | Evidence that the product can attract recurring use and that its real workload and unit costs can be measured | Review reliability, capacity, unit cost, and credible revenue or funding paths. Evaluate narrowly scoped paid capacity where free limits materially constrain users. |
| 10,000 MAU | Early-growth capacity objective for the existing product architecture | Support this scale through efficient data models, direct media delivery, bounded workers, measurement, and vertical capacity upgrades before considering microservice extraction. |

The project does not assume that a no-cost hosted tier can or should support
10,000 MAU. Free-tier capacity will be used as far as it remains reliable and
appropriate for the promises made to users. Reaching 1,000 MAU does not
automatically trigger spending; it triggers a review informed by observed
usage and an opportunity to define a sustainable revenue or funding path.

MAU is a product-scale target, not a sufficient infrastructure model by itself.
Before external launch, the project must also define and measure a representative
workload including peak concurrent sessions, listening hours, writes per active
user, catalog size, saved learning items, processing jobs, storage, and egress.
Those measurements—not account count alone—determine when capacity must change.

### Dependency policy

Every production dependency must have a clear product or operational purpose.
Before adding a hosted service, SDK, broker, database, cache, analytics product,
or AI provider, record at minimum:

- The problem it solves now.
- Why the current components cannot solve that problem adequately.
- Its free allowance and the behavior when that allowance is exhausted.
- Its expected cost driver: requests, compute time, tokens, storage, egress,
  users, or another unit.
- How data and configuration can be exported or reconstructed.
- How the application behaves when the dependency is unavailable.
- The smallest viable replacement or migration path.

Dependencies should use application-owned interfaces at external boundaries.
This does not require abstracting every internal library. Abstractions are
required where they protect domain logic, credentials, data portability, or a
meaningful provider substitution.

### Capacity before topology

When the system approaches a limit, consider responses in this order unless
evidence supports a different order:

1. Measure and remove waste, duplicate work, and accidental load.
2. Cache or reuse immutable and shared results where rights permit.
3. Adjust queries, indexes, batching, concurrency, or resource limits.
4. Increase capacity or service quality for the existing component.
5. Add a narrowly justified supporting component such as a CDN or cache.
6. Independently scale the existing worker deployment.
7. Extract a module into a paid service only after the technical and financial
   gates in this ADR are satisfied.

### Cost-aware content processing

- A deterministic or provider-generated artifact should be reused across users
  when licensing, privacy, versioning, and product correctness allow it.
- Jobs must be idempotent so retries do not create duplicate artifacts or
  duplicate provider charges.
- Provider calls must support bounded concurrency, timeouts, bounded retries,
  and a spend or usage limit before open-ended ingestion is enabled.
- Expensive derived content must record its input version and provider/model
  provenance so stale results can be identified without regenerating
  everything.
- Development and automated tests must use fixture or local adapters by default
  and must not silently incur third-party charges.
- Raw media and derived artifacts must have explicit retention and deletion
  rules before user uploads are enabled.

### Observability and upgrade triggers

The project will measure only the signals necessary to make the next decision.
Initial signals should include:

- Application request latency and error rate.
- Database size, connections, slow queries, and storage utilization.
- Object-storage volume and media-delivery bandwidth or egress.
- Worker queue depth, job duration, retries, and failures.
- External-provider requests and estimated or actual spend.
- Cost per processed song and, once hosted usage exists, cost per listening
  hour and active user.
- Monthly active users, peak concurrent sessions, and representative actions
  per active user.

Exact numeric thresholds will be added when a concrete hosting or provider
choice exposes real limits. The threshold and its response must be documented
before relying on that provider in production.

### What this means in practice

- Local development must not require paid cloud accounts.
- The hosted prototype should remain within no-cost allowances whenever those
  allowances meet current reliability and access needs.
- Data access must be paginated and indexed for the representative 10,000-MAU
  workload; user records should reference shared catalog, lyric, and explanation
  artifacts rather than duplicating them.
- PostgreSQL-compatible storage, HTTP, standard object interfaces, and portable
  data formats are preferred over proprietary equivalents when otherwise
  suitable.
- UtaStream-owned identifiers and domain models must not encode a hosting
  provider's resource identifiers as their primary meaning.
- A free tier is not acceptable if it prevents practical export, creates an
  unsafe reliability model, or forces core business rules to match the vendor.
- A paid upgrade is a reviewed decision with a known trigger, expected benefit,
  recurring cost, rollback or migration plan, and funding rationale.
- Revenue and subscription design will be handled separately after the general
  product is working; this ADR must not invent premium features or user tiers.

### What this decision does not mean

- Every dependency must be self-hosted.
- Free tiers are automatically preferable regardless of reliability, privacy,
  rights, or migration risk.
- The application must be engineered today for millions of users.
- The project will avoid all paid infrastructure indefinitely.
- Microservices are forbidden; they are gated by evidence and sustainability.
- A portability layer must be built around ordinary internal libraries that
  pose no meaningful lock-in risk.
- Revenue planning must begin before validating the core product.

## Considered Options

### Option 1: Hybrid, portable, no-cost-first infrastructure — chosen

Use local open-source components and selectively use managed free tiers backed
by portable technology and explicit migration paths.

**Advantages**

- Minimizes early recurring spend and operational work.
- Makes local development independent of cloud availability.
- Preserves the ability to purchase capacity without rewriting domain logic.
- Allows the project to learn which services are actually valuable.

**Disadvantages**

- Portability requires disciplined boundaries and occasional migration tests.
- Free tiers can have sleep, quota, performance, and support limitations.
- The lowest-cost initial provider may not be the lowest-cost growth provider.

### Option 2: Self-host all open-source infrastructure

Operate the database, object storage, queue, monitoring, and other services
directly from the beginning.

**Advantages**

- High control and reduced product-level vendor dependence.
- Software licensing costs may be low.

**Disadvantages**

- Transfers cost into operations, patching, backups, security, and incident
  response.
- A nominally free software stack still requires compute and engineering time.
- Distracts from product validation at the current project stage.

### Option 3: Commit to one integrated cloud platform

Use one provider's proprietary database, storage, functions, queues, identity,
and monitoring stack.

**Advantages**

- Fast integration and one operational control plane.
- Mature scaling and managed-service options may be available.

**Disadvantages**

- Pricing and service limits can become architecture constraints.
- Migration becomes harder when product logic uses proprietary primitives.
- Encourages adding services because they are available rather than necessary.

### Option 4: Design a distributed microservice platform immediately

Adopt independently deployed services, brokers, service discovery, distributed
tracing, and service-owned data before product validation.

**Advantages**

- High theoretical isolation and independent scaling.
- Establishes patterns that may be useful at large scale.

**Disadvantages**

- Adds recurring infrastructure and operational costs without current demand.
- Increases local-development, testing, deployment, and debugging complexity.
- Has no defined revenue stream to sustain the additional burden.
- Risks encoding speculative service boundaries before the domain is learned.

## Rationale

The hybrid approach recognizes that open-source software and managed services
solve different problems. Open-source, standard technology protects the
project's data model and migration options; carefully chosen managed free tiers
can avoid turning the project's earliest months into infrastructure operations.

The architecture already supplies useful scaling seams: a browser client, an
application API, a separately deployable worker, capability modules, relational
storage, object storage, and provider adapters. Keeping those seams while
limiting deployed components gives UtaStream a credible growth path without
paying for hypothetical demand.

Gating paid microservices on both measured technical need and sustainable
funding prevents “scale” from becoming a reason to accept indefinite costs
before the product has established how it creates value.

## Consequences

### Positive

- Product work remains the primary early investment.
- Most early development and testing can run without recurring service costs.
- Managed capacity can be purchased later without changing product concepts.
- Fewer dependencies reduce failure modes, credentials, upgrades, and vendor
  relationships.
- Cost drivers become observable before open-ended workloads are enabled.
- Microservice adoption becomes a business and technical decision rather than
  an architectural fashion choice.

### Negative

- Some provider-specific conveniences will be intentionally avoided.
- The team must maintain export, migration, and fixture-backed development
  paths.
- Free-tier ceilings may require an earlier operational decision than a fully
  paid platform would.
- Running with minimal dependencies may require small application-owned
  solutions before adopting a specialized service.
- Numeric capacity thresholds cannot be finalized until actual infrastructure
  providers and early usage are known.

### Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| A free provider changes or removes its plan | Medium | Medium | Keep local equivalents, export procedures, and provider boundaries; do not rely on free-tier behavior as a domain rule. |
| Portability work becomes speculative abstraction | Medium | Medium | Add boundaries only around external systems, data ownership, and demonstrated substitution risks. |
| Zero-cost preference harms reliability for testers | Medium | High | Treat user impact as an upgrade trigger and review the smallest paid capacity improvement before architectural change. |
| Provider calls produce uncontrolled spend | Medium | High | Default to fixtures, require quotas and concurrency limits, and expose provider usage before enabling open-ended jobs. |
| Microservice migration is delayed despite real pressure | Low | High | Permit investigation when technical triggers appear; require explicit funding or revenue evidence before recurring paid adoption. |
| Hidden egress or storage cost dominates | Medium | High | Track bytes stored and delivered; place media delivery outside ordinary API handlers; evaluate CDN use only from measured traffic. |
| Too many “free” services create operational complexity | Medium | Medium | Maintain a dependency register and prefer using an existing component over adding another service. |

## Adoption Plan

1. Review and amend this proposal before accepting it.
2. For the stack ADR, compare candidates using local operation, number of
   required services, free hosted allowance, portability, export, and upgrade
   path—not feature count alone.
3. Establish a dependency register before introducing hosted production
   services.
4. Build the walking skeleton using local or fixture-backed dependencies.
5. Before hosting external testers, record each selected provider's limits,
   exhaustion behavior, export path, and first paid-capacity option.
6. Add lightweight measurements for database use, object storage, bandwidth,
   jobs, and provider calls.
7. Define numeric alert and upgrade thresholds from actual provider limits and
   observed usage.
8. At 1,000 MAU, conduct a documented proof-of-scale review covering user
   behavior, capacity, reliability, unit cost, and credible funding or revenue
   paths before planning the 10,000-MAU operating posture.
9. Validate representative 10,000-MAU data volumes and access patterns with
   load and capacity tests before claiming readiness for that scale.
10. Revisit infrastructure topology only when those thresholds show that
   capacity tuning or vertical scaling is insufficient.

## Validation

This decision is working when:

- A contributor can run and test the core product without a paid cloud account.
- The hosted prototype incurs no recurring infrastructure cost unless an
  exception has been reviewed and documented.
- The application can replace hosted providers with local or fixture adapters
  for development and tests.
- Provider or free-tier exhaustion fails predictably rather than creating
  surprise charges or data loss.
- Increasing database, compute, storage, or worker capacity does not require a
  domain-model rewrite.
- Each production dependency has a current purpose, owner, cost driver, and
  migration path.
- A proposed paid microservice includes measured technical evidence and a
  defined sustainable funding or revenue basis.
- At 1,000 MAU, the project can report observed unit costs and identify the
  smallest infrastructure changes required to progress toward 10,000 MAU.

## Revisit Triggers

Reconsider this decision if:

- No-cost tiers cannot meet minimum privacy, rights, reliability, or access
  requirements for product validation.
- Portability constraints materially slow product delivery without reducing a
  credible lock-in risk.
- Measured demand makes a different infrastructure topology more economical.
- A defined revenue stream changes the acceptable relationship between cost,
  reliability, speed, and operational complexity.
- A legal or licensing requirement mandates a particular provider or hosting
  model.

## References

- [ADR-0002: Start with a modular monolith and vertical slices](./0002-start-with-a-modular-monolith-and-vertical-slices.md)
- [Initial architecture](../architecture/initial-architecture.md)
- [UtaStream Project Manifesto](./manifesto-v1.md)

## Change History

| Date | Change | Author |
| --- | --- | --- |
| 2026-10-22 | Initial proposal incorporating no-cost-first, dependency-minimization, and revenue-gated microservice constraints | Codex with Zack Roland |
| 2026-10-22 | Added 1,000-MAU proof-of-scale gate and 10,000-MAU early-growth target | Codex with Zack Roland |
