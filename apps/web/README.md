# UtaStream web client

This is the production React client governed by ADR-0004. The Figma Make
snapshot remains under `prototypes/` as design and behavior evidence; it is not
an importable application dependency.

## Source boundaries

- `app/` composes the application and owns global providers, routing, and
  startup concerns.
- `features/` contains product-capability UI and client-side orchestration.
  Initial boundaries are catalog, playback, lyrics, and learning.
- `shared/` contains code that is genuinely reusable across features. Avoid
  placing feature-specific components here for convenience.
- A feature may import from `shared/`. Features should communicate through
  explicit public exports rather than importing one another's internal files.

Prefer files below roughly 250 lines. Split by responsibility when a component
owns multiple independent states or renders multiple independently testable
regions; do not split merely to satisfy a line count.

## Local commands

From the repository root:

```sh
npx pnpm@10.34.3 install
npx pnpm@10.34.3 dev:web
```

