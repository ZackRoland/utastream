# ADR-0004: Use React, FastAPI, and PostgreSQL as the Baseline Stack

- **Status:** Accepted
- **Date:** 2026-10-23
- **Decision owners:** Zack Roland
- **Related documents:** [ADR-0002](./0002-start-with-a-modular-monolith-and-vertical-slices.md), [ADR-0003](./0003-use-cost-aware-evolutionary-infrastructure.md), [ADR-0005](./0005-generate-typescript-api-contracts-from-openapi.md), [initial architecture](../architecture/initial-architecture.md)
- **Supersedes:** N/A
- **Superseded by:** N/A

## Context

UtaStream is moving from an interactive Figma Make prototype into an executable
walking skeleton. The project needs a baseline stack before repository
scaffolding or alternate-stack benchmarks can produce useful evidence.

ADR-0002 selects a modular monolith with a separately deployable worker.
ADR-0003 requires local development without paid services, minimal
dependencies, portable data, an economical path to 1,000 monthly active users,
and a practical capacity path to 10,000 monthly active users.

The Figma Make prototype already expresses the client in React and TypeScript.
The backend choice must support ordinary product APIs, PostgreSQL persistence,
durable content-processing jobs, and future Japanese-language processing. The
project also has an explicit learning goal: meaningful experience with a modern
Python API stack is valuable to the owner as a junior software engineer. That
goal is relevant when it aligns with product needs, but it does not override
maintainability or cost constraints.

## Decision Drivers

- Preserve the existing React and TypeScript product direction.
- Use open-source tools that run locally without paid accounts.
- Keep application data portable through PostgreSQL and standard interfaces.
- Support the modular-monolith capability boundaries in ADR-0002.
- Run the API and background worker as separate processes while sharing domain
  modules.
- Avoid Redis, RabbitMQ, Kafka, Kubernetes, or a workflow service initially.
- Establish explicit, testable contracts across the Python/TypeScript boundary.
- Provide professionally relevant experience without collecting unnecessary
  technologies.
- Remain credible for the 1,000-to-10,000-MAU planning envelope.

## Decision

UtaStream's baseline application stack will be:

| Concern | Baseline choice | Boundary |
| --- | --- | --- |
| Web client | React, Vite, and TypeScript | Browser presentation, accessible interaction, audio controls, and transient UI state |
| Application API | Python and FastAPI | HTTP boundary, authentication/authorization enforcement, orchestration, and response validation |
| Validation and API models | Pydantic | Explicit request and response models; database models are not exposed directly |
| Relational database | PostgreSQL | Authoritative structured application and job state |
| Database access | SQLAlchemy 2 | Explicit persistence and transaction boundaries |
| Schema migrations | Alembic | Version-controlled forward database evolution |
| PostgreSQL driver | Psycopg 3 | Standard PostgreSQL connectivity; synchronous or asynchronous mode chosen from measured need |
| Background processing | Separate Python worker using the same server-side capability modules | Long-running, retryable work outside API requests |
| Initial job mechanism | Narrow application-owned PostgreSQL job table | Durable claiming, bounded retries, idempotency, status, and recovery without another service |
| Client/API contract | FastAPI OpenAPI document and generated TypeScript types | Governed separately by ADR-0005 |
| Python dependency management | `uv` with a committed lockfile | Reproducible Python environments |
| JavaScript dependency management | `pnpm` with a committed lockfile | Reproducible client workspace |
| Python tests | pytest | Domain, API, persistence, and worker tests |
| Client tests | Vitest | TypeScript and React unit/component tests |
| End-to-end tests | Playwright | Browser-level listening-to-learning flows |
| Local structured storage | Local PostgreSQL | No paid account required |
| Local binary storage | Filesystem adapter behind an object-storage port | Avoid running an additional storage service until compatibility testing needs one |
| Deployment packaging | Ordinary API and worker processes with container-compatible configuration | No permanent cloud host selected |

The Python API and worker form one modular application. They share domain and
application modules, migrations, and PostgreSQL, but have separate process
entrypoints so interactive requests and content processing can be allocated and
scaled independently. They are not separate microservices.

### Repository shape

The initial repository should follow this conceptual structure:

```text
utastream/
├── apps/
│   ├── web/                  React/Vite/TypeScript
│   ├── api/                  FastAPI process entrypoint
│   └── worker/               Python worker process entrypoint
├── python/
│   └── utastream/
│       ├── identity/
│       ├── catalog/
│       ├── playback/
│       ├── lyrics/
│       ├── learning/
│       ├── processing/
│       ├── providers/
│       └── database/
├── packages/
│   └── api-contract/         Generated TypeScript API types
├── migrations/               Alembic migrations
├── tests/
│   └── e2e/                  Playwright tests
└── infrastructure/
    └── local/                Local-development configuration
```

Exact directories may change during scaffolding when a simpler arrangement
provides the same boundaries. This ADR governs responsibilities and technology
choices, not every folder name.

### Background-job boundary

Stage one will not use FastAPI's in-process background tasks for durable content
processing. The API will commit a job record to PostgreSQL, and a separate
worker will claim and process available jobs.

The narrow job implementation must support:

- Atomic claiming across multiple workers.
- Persistent status and attempt history sufficient for support and recovery.
- Idempotency keys for work that could create duplicated artifacts or charges.
- Bounded attempts, backoff, expiration, and abandoned-claim recovery.
- Per-job-type concurrency limits.
- Graceful shutdown and safe task redelivery.
- Retention or cleanup of completed records.

It will not initially implement arbitrary workflow graphs, event replay,
general publish/subscribe, cross-region coordination, or a custom queue
dashboard. Those needs would trigger a separate queue decision.

### What this means in practice

- Client code remains TypeScript; server domain and application code remains
  Python.
- The web client calls an HTTP contract rather than importing Python domain
  models.
- Database tables are accessed through server-side persistence interfaces only.
- Media bytes and artwork do not travel through PostgreSQL or ordinary JSON API
  handlers.
- Local development and tests use fixture providers and cannot silently spend
  money on external APIs.
- Infrastructure providers must not be selected merely because they offer a
  framework-specific integration.
- The walking skeleton is built on this baseline before alternate builds are
  commissioned under ADR-0006.

### What this decision does not mean

- Python and TypeScript types are automatically identical.
- Every database operation must use asynchronous Python APIs.
- SQLAlchemy models are domain models or API response models.
- The application will never introduce a dedicated queue.
- FastAPI must host audio or artwork.
- Vite determines the permanent deployment provider.
- The stack is immutable after benchmark or production evidence demonstrates a
  better fit.

## Considered Options

### Option 1: React/Vite/TypeScript with Python/FastAPI — chosen

Use a TypeScript browser client and a Python modular backend, connected through
an OpenAPI-described HTTP contract.

**Advantages**

- Preserves the existing React prototype direction.
- FastAPI and Pydantic produce explicit runtime-validated API models and an
  OpenAPI contract.
- Python aligns with likely text-processing, evaluation, and content-pipeline
  experiments.
- Provides meaningful modern Python backend experience alongside frontend
  TypeScript.
- SQLAlchemy and Alembic support portable PostgreSQL persistence and migrations.
- API and worker can share Python domain modules without being separate services.

**Disadvantages**

- Requires Python and JavaScript toolchains, lockfiles, linters, type checkers,
  and test runners.
- Cross-language types require generation and contract checks.
- Cross-layer refactoring is more deliberate than in a unified TypeScript
  repository.
- A durable Python job mechanism is less immediately obvious than pg-boss in a
  Node stack, so stage one owns a deliberately narrow implementation.

### Option 2: React/Vite/TypeScript with Node.js/Fastify

Use TypeScript across the client, API, worker, validation schemas, and database
access.

**Advantages**

- One language and package ecosystem across the application.
- Easier direct sharing of safe contract schemas and refactoring tools.
- Lower initial tooling burden.
- pg-boss offers a PostgreSQL-backed durable job option without adding Redis.

**Disadvantages**

- Provides less backend-language breadth for the project owner.
- Python may still be introduced later for language-processing workloads.
- Direct type sharing can blur API, domain, and persistence boundaries if not
  governed carefully.

This is the strongest rejected baseline and the first alternate implementation
candidate after the chosen baseline is working.

### Option 3: Next.js full-stack application

Use a React meta-framework for client rendering and server-side endpoints.

**Advantages**

- Consolidated application scaffolding, routing, and deployment conventions.
- Can reduce initial project count for ordinary request/response features.

**Disadvantages**

- Background workers and long-running processing still require a separate
  runtime boundary.
- Framework hosting conventions can narrow deployment choices.
- Server rendering is not a primary requirement for UtaStream's authenticated,
  highly interactive player.
- Python may still be required for content-processing experiments.

### Option 4: React client with NestJS backend

Use a structured TypeScript server framework with dependency injection and
explicit modules.

**Advantages**

- Strong conventions and modular organization.
- One application language across the stack.
- Familiar enterprise patterns for larger teams.

**Disadvantages**

- Adds framework concepts and ceremony before the team needs them.
- Does not provide the Python learning and processing benefits sought here.
- The existing ADR module boundaries can be enforced without a container-based
  framework.

### Option 5: Direct backend-as-a-service client

Allow the browser to access database, authentication, storage, and generated
APIs primarily through a provider SDK.

**Advantages**

- Very fast for a narrow prototype.
- Minimal custom server code for basic data access.

**Disadvantages**

- Couples authorization and data access closely to one provider.
- Makes content rights, provider credentials, background work, and application
  invariants harder to centralize.
- Weakens the portability goals in ADR-0003.

A backend-as-a-service may host PostgreSQL or object storage later, but it will
not replace UtaStream's application API boundary.

## Rationale

The chosen stack accepts modest cross-language tooling cost in return for a
clear API boundary, Python backend experience, and alignment with plausible
language-processing work. These benefits are directly relevant to the product
rather than unrelated résumé-driven technology collection.

Performance is not the differentiator. Both FastAPI and Fastify are credible at
the 1,000-to-10,000-MAU planning envelope when queries, media delivery, and jobs
are designed appropriately. The more important tradeoff is unified tooling
versus an explicit cross-language boundary and Python ecosystem.

## Consequences

### Positive

- The application has a concrete, portable foundation for its walking skeleton.
- Python API and content-processing knowledge develop within real product work.
- OpenAPI makes the frontend/backend boundary visible and testable.
- PostgreSQL serves application state and early durable jobs without another
  infrastructure dependency.
- The API and worker can scale independently without becoming microservices.

### Negative

- Contributors must maintain both Python and TypeScript development workflows.
- Contract generation becomes a required repository check.
- The project owns a small amount of reliable job-claiming behavior.
- Full-stack changes can require coordinated Python and TypeScript edits.

### Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Two toolchains slow local development | Medium | Medium | Provide one top-level bootstrap, test, format, and run workflow with locked dependencies. |
| API types drift | Medium | High | Apply ADR-0005 generation and CI drift checks. |
| Custom job table grows into a workflow engine | Medium | High | Keep its feature list narrow and define extraction triggers before adding features. |
| Worker load harms interactive queries | Medium | High | Separate processes, bound concurrency, measure database load, and upgrade or extract only from evidence. |
| Async Python complexity is adopted without benefit | Medium | Medium | Start with the simplest correct SQLAlchemy execution model and introduce async only for measured concurrency needs. |
| Résumé goals override product simplicity | Low | Medium | Require each dependency and pattern to solve a current product or operational problem under ADR-0003. |

## Adoption Plan

1. Review and accept or amend this ADR before scaffolding production code.
2. Establish locked Python and JavaScript environments plus top-level developer
   commands.
3. Scaffold the React client, FastAPI application, Python worker, PostgreSQL,
   migrations, and test layers.
4. Implement ADR-0005 contract export and drift checking.
5. Implement the walking skeleton using fixtures and permitted seeded content.
6. Add the narrow job table and prove restart, retry, idempotency, and abandoned-
   claim recovery.
7. Record baseline setup, dependency, test, and operational evidence for future
   ADR-0006 comparisons.

## Validation

This decision is working when:

- A new checkout can run locally without paid services.
- One documented command starts the client, API, worker, and PostgreSQL or
  clearly orchestrates their individual commands.
- The walking skeleton passes unit, integration, contract, and browser tests.
- Frontend code receives typed API responses without hand-maintained duplicate
  interfaces.
- Restarting the API or worker does not lose an accepted job.
- Provider fixtures replace external paid APIs in development and CI.
- Capacity tests show no architectural blocker to the initial MAU targets.

## Revisit Triggers

Reconsider this decision if:

- Maintaining two ecosystems consistently blocks product delivery.
- Python provides no meaningful product, processing, or learning value after
  the walking skeleton.
- Contract generation creates persistent unrecoverable friction.
- The PostgreSQL job mechanism harms application reliability or becomes a
  general workflow platform.
- Alternate builds under ADR-0006 demonstrate a materially better fit using the
  frozen acceptance criteria.

## References

- [FastAPI features](https://fastapi.tiangolo.com/features/)
- [FastAPI background tasks](https://fastapi.tiangolo.com/tutorial/background-tasks/)
- [SQLAlchemy PostgreSQL documentation](https://docs.sqlalchemy.org/en/21/dialects/postgresql.html)
- [ADR-0002](./0002-start-with-a-modular-monolith-and-vertical-slices.md)
- [ADR-0003](./0003-use-cost-aware-evolutionary-infrastructure.md)

## Change History

| Date | Change | Author |
| --- | --- | --- |
| 2026-10-23 | Initial proposal following stack evaluation with the project owner | Codex with Zack Roland |
| 2026-10-23 | Accepted by the decision owner | Zack Roland |
