# Media Import Increment 3 Acceptance

**Status:** Complete — pending owner review  
**Date:** 2026-11-11  
**Scope:** Generated TypeScript API contract and application-owned transport

## Delivered

- A workspace package that commits the deterministic OpenAPI document and
  generated TypeScript types.
- A pinned, type-only `openapi-typescript` generator with a do-not-edit header.
- One root command to regenerate both artifacts and one command that fails on
  OpenAPI or TypeScript contract drift.
- A small web-owned HTTP client covering base URL configuration, same-origin
  credentials, cancellation, JSON requests, and normalized shared errors.
- Typed system API methods that consume generated operation response types.
- A Vite `/api` development proxy and `VITE_API_BASE_URL` override.

## Acceptance evidence

1. Repeated generation produces byte-identical committed artifacts.
2. Drift checking passes for both OpenAPI and TypeScript output.
3. The web TypeScript compiler resolves generated operation types through the
   workspace package.
4. Transport tests verify URL normalization, credentials, cancellation,
   successful typed responses, and shared error-envelope normalization.
5. Existing API, migration, web interaction, and production-build gates remain
   green.

## Deferred by design

- The catalog/import HTTP surface will be introduced alongside its use cases;
  this increment does not invent premature endpoints.
- Generated types are transport contracts, not UI view models or persistence
  entities.
- Runtime validation remains selective at the error boundary, as decided in
  ADR-0005; the server continues to own full request/response validation.
