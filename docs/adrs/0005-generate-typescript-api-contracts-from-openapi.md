# ADR-0005: Generate TypeScript API Contracts from OpenAPI

- **Status:** Accepted
- **Date:** 2026-10-23
- **Decision owners:** Zack Roland
- **Related documents:** [ADR-0004](./0004-use-react-fastapi-and-postgresql-as-the-baseline-stack.md)
- **Supersedes:** N/A
- **Superseded by:** N/A

## Context

ADR-0004 places the web client in TypeScript and the application backend in
Python. Static types cannot cross that language and network boundary directly.
Manually maintaining matching Pydantic and TypeScript interfaces would create a
predictable source of drift, especially as lyric, learning, pagination, job,
and error contracts evolve.

FastAPI derives an OpenAPI 3.1 document from route declarations and Pydantic
request and response models. Open-source tooling can translate that standard
document into TypeScript types without a hosted or paid service. The workflow
still needs governance: generated code can become stale, noisy, overly large,
or misleading when Python and TypeScript represent values differently.

## Decision Drivers

- Avoid hand-maintained duplicate API interfaces.
- Require no paid generator or API-management service.
- Keep OpenAPI as a standard, portable contract artifact.
- Make drift a build failure rather than a runtime surprise.
- Minimize generated runtime code and frontend bundle weight.
- Keep API, domain, and persistence models separate.
- Support predictable reviews and replacement of the generator.

## Decision

FastAPI/Pydantic request and response models will be the source from which
UtaStream exports a deterministic OpenAPI document. A pinned, open-source
generator will convert that document into TypeScript **types only** for the web
client.

The initial workflow will be:

```text
Pydantic API models
    -> deterministic FastAPI OpenAPI export
    -> committed openapi.json
    -> pinned TypeScript type generator
    -> committed generated TypeScript types
    -> small application-owned fetch client
```

The project will initially prefer a type-only generator such as
`openapi-typescript` over a full SDK generator. The application will own a thin
HTTP transport wrapper for base URL configuration, credentials, cancellation,
normalized errors, and request identifiers.

### Contract rules

- Every public route must declare explicit request and response models.
- Database and SQLAlchemy models must not be serialized as the public contract
  by default.
- Endpoint operation identifiers must be stable and intentional.
- Dates and timestamps cross the boundary as documented ISO 8601 strings.
- UUIDs cross as strings and are validated by the server.
- Money or precision-sensitive decimal values must not silently become
  imprecise JavaScript numbers.
- Missing and nullable values are distinct and must be modeled deliberately.
- Error responses use a shared, versioned envelope with a stable machine code,
  human-safe message, and request identifier where available.
- List endpoints define pagination rather than returning unbounded collections.
- Binary media is not embedded in ordinary JSON contracts.
- Breaking contract changes require an explicit migration or API compatibility
  plan before release.

### Generation and CI rules

- Generator versions and dependencies are locked.
- Generated files contain a warning that they must not be edited manually.
- The OpenAPI document and TypeScript output are committed so ordinary frontend
  work does not require a running Python server.
- One top-level command regenerates both artifacts.
- Contract export must not require cloud credentials, paid services, or a live
  production database.
- CI regenerates the artifacts and fails if the repository becomes dirty.
- CI type-checks the client against the generated types.
- Contract tests exercise representative timestamps, identifiers, enums,
  nullability, pagination, validation failures, and shared error responses.

### Runtime validation boundary

Generated TypeScript types provide compile-time assistance; they do not exist
at runtime. Pydantic validates server inputs and declared outputs. The client
will not initially duplicate every schema with another runtime validation
library.

Runtime client validation may be added selectively for high-risk data,
untrusted third-party responses, offline caches, or compatibility boundaries.
Adding a general validation library requires evidence that server validation
and contract tests are insufficient.

### What this means in practice

- Changing an API response model normally produces an OpenAPI and generated-
  type diff in the same change.
- Frontend components import generated API types rather than recreating them.
- Frontend view models may wrap or transform API types; generated transport
  types do not dictate component state design.
- The OpenAPI artifact can support documentation, mocks, contract testing, and
  future non-TypeScript clients.
- Replacing the generator must not require changing the backend or persisted
  data.

### What this decision does not mean

- Generated TypeScript proves that a runtime response is correct.
- Python and TypeScript have identical type systems.
- Generated API types are domain entities or UI view models.
- Every network interaction, including WebSockets or audio range requests, must
  be modeled through ordinary OpenAPI JSON operations.
- A large generated SDK or hosted API gateway is required.
- API compatibility is automatic merely because generation succeeds.

## Considered Options

### Option 1: Generate TypeScript types from FastAPI OpenAPI — chosen

**Advantages**

- No required service or licensing cost with open-source tooling.
- Makes the cross-language contract explicit and reviewable.
- Reduces duplicate interface maintenance.
- Preserves a standard artifact independent of a specific generator.
- Type-only output has minimal runtime and bundle impact.

**Disadvantages**

- Adds a generation and CI step.
- Generated diffs may be noisy.
- Python/OpenAPI concepts such as datetime, UUID, decimals, and nullability need
  serialization conventions.
- Developers must understand that compile-time types are not runtime validation.

### Option 2: Hand-write matching TypeScript interfaces

**Advantages**

- No generator dependency or build step.
- Frontend types can be shaped directly for component needs.

**Disadvantages**

- Predictable drift between Python and TypeScript.
- Reviewers must manually compare two definitions.
- Renames and nested contract changes fail late.

Frontend-specific view models remain appropriate, but they must be derived from
generated transport types rather than replacing them.

### Option 3: Generate a complete TypeScript SDK

**Advantages**

- Generates endpoints, transport code, and models.
- Can reduce handwritten request wrappers for a large API.

**Disadvantages**

- Produces more code, churn, configuration, and generator-specific behavior.
- May impose transport, error, and authentication conventions UtaStream does not
  want.
- Can increase frontend bundle size and debugging distance.

This may be reconsidered if the API becomes large enough that the thin client is
materially harder to maintain.

### Option 4: Share types through a unified TypeScript backend

**Advantages**

- Direct schema and type sharing can be simpler.
- Removes cross-language generation.

**Disadvantages**

- Abandons the FastAPI/Python benefits selected in ADR-0004.
- In-process type sharing can hide the fact that HTTP serialization remains a
  runtime boundary.

## Rationale

The type-generation step has negligible compute cost and no required hosted
service cost. Its engineering costs are controlled by generating only simple
types, committing artifacts, pinning the generator, and making drift visible in
CI. OpenAPI remains useful even if the generator changes, which supports the
portability goals in ADR-0003.

## Consequences

### Positive

- Backend contract changes become visible to frontend compilation and review.
- API documentation, mocks, tests, and future clients share one standard
  description.
- The web client avoids maintaining a parallel set of transport interfaces.
- The generator remains replaceable.

### Negative

- Contract regeneration is part of normal development.
- Generated artifacts add repository changes.
- Some serialization rules require explicit human judgment and tests.
- Cross-language breaking changes still require coordinated releases.

### Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Generated types become stale | Medium | High | CI regenerates and rejects drift. |
| Output churn obscures meaningful review | Medium | Medium | Generate types only, pin versions, and separate generated files. |
| Nullability or precision is modeled incorrectly | Medium | High | Document conventions and add focused contract tests. |
| Contract export requires runtime infrastructure | Medium | Medium | Use an application factory and deterministic export command without startup side effects. |
| Generator becomes unmaintained | Low | Medium | Preserve standard OpenAPI, keep transport wrapper application-owned, and test replacement output. |
| Generated types leak into every UI layer | Medium | Medium | Transform transport records into feature view models where behavior or presentation differs. |

## Adoption Plan

1. Select and pin a type-only OpenAPI-to-TypeScript generator during repository
   scaffolding.
2. Define stable FastAPI operation identifiers and shared error models.
3. Add a deterministic OpenAPI export command with no external dependencies.
4. Generate and commit the first OpenAPI document and TypeScript types.
5. Add the thin fetch wrapper and representative contract tests.
6. Add CI drift detection and frontend type checking.
7. Document serialization conventions alongside the API code.

## Validation

This decision is working when:

- A backend response change that affects the client produces a deterministic
  contract diff.
- Forgetting to regenerate fails CI.
- Frontend API calls require no manually duplicated transport interfaces.
- A clean checkout can generate contracts without cloud access.
- Generated types do not add runtime bundle code by themselves.
- Representative edge cases pass contract tests.

## Revisit Triggers

Reconsider this decision if:

- Generator output remains unstable despite pinned versions.
- The thin fetch wrapper grows into an unmaintainable handwritten SDK.
- UtaStream adds clients whose needs justify a broader SDK-generation strategy.
- Non-HTTP or streaming interactions become the dominant application boundary.
- Contract generation repeatedly blocks ordinary development despite the CI and
  automation controls.

## References

- [FastAPI: Generating SDKs](https://fastapi.tiangolo.com/advanced/generate-clients/)
- [FastAPI features](https://fastapi.tiangolo.com/features/)
- [`openapi-typescript` license](https://github.com/openapi-ts/openapi-typescript/blob/main/packages/openapi-typescript/LICENSE)
- [ADR-0004](./0004-use-react-fastapi-and-postgresql-as-the-baseline-stack.md)

## Change History

| Date | Change | Author |
| --- | --- | --- |
| 2026-10-23 | Initial proposal following review of cross-language contract costs and risks | Codex with Zack Roland |
| 2026-10-23 | Accepted by the decision owner | Zack Roland |
