# Architecture Decision Records

Architecture Decision Records (ADRs) preserve important product, design, and
technical decisions together with the context and tradeoffs that led to them.
They explain why UtaStream made a choice; they are not a substitute for product
requirements, implementation documentation, or task tracking.

## Naming Convention

Use a four-digit sequence number followed by a short, lowercase title:

```text
NNNN-short-decision-title.md
```

For example:

```text
0001-use-figma-as-design-source-of-truth.md
```

Copy [`adr-template.md`](./adr-template.md) when starting a new record. Keep the
original number even if the ADR is later superseded or deprecated.

## Status Lifecycle

- **Proposed:** The decision is under active discussion.
- **Accepted:** The decision is approved and should guide current work.
- **Deprecated:** The decision remains historically relevant but should no
  longer guide new work.
- **Superseded:** A newer ADR replaces the decision. Link both records.
- **Rejected:** The option was considered and intentionally not adopted.

Substantive changes to an accepted decision should normally be recorded in a
new ADR that supersedes the old one. Small clarifications and corrections can
be made in place and noted in the change history.

## ADR Index

| ADR | Title | Status | Date |
| --- | --- | --- | --- |
| [0001](./0001-use-figma-as-design-source-of-truth.md) | Use Figma as the design source of truth | Accepted | 2026-10-12 |
| [0002](./0002-start-with-a-modular-monolith-and-vertical-slices.md) | Start with a modular monolith and vertical slices | Accepted | 2026-10-19 |
| [0003](./0003-use-cost-aware-evolutionary-infrastructure.md) | Use cost-aware evolutionary infrastructure | Accepted | 2026-10-22 |
| [0004](./0004-use-react-fastapi-and-postgresql-as-the-baseline-stack.md) | Use React, FastAPI, and PostgreSQL as the baseline stack | Accepted | 2026-10-23 |
| [0005](./0005-generate-typescript-api-contracts-from-openapi.md) | Generate TypeScript API contracts from OpenAPI | Accepted | 2026-10-23 |
| [0006](./0006-use-governed-ai-agents-for-alternate-build-evaluations.md) | Use governed AI agents for alternate-build evaluations | Accepted | 2026-10-23 |
| [0007](./0007-use-browser-first-provider-based-media-and-lyrics.md) | Use browser-first provider-based media and lyrics | Accepted | 2026-10-27 |
| [0008](./0008-identify-tracks-with-metadata-confirmation-and-fingerprinting.md) | Identify tracks with metadata, confirmation, and deferred fingerprinting | Accepted | 2026-10-27 |

