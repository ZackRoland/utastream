# UtaStream

UtaStream is a music-first application that helps Japanese learners understand
and retain language from songs they already enjoy. Listening remains complete
on its own; synchronized lyrics, readings, contextual explanations, saved
expressions, and review are available when the listener chooses to learn.

The project is implementing its first production-shaped vertical slices from
the accepted architecture and interaction prototype.

## Build and local development

### Prerequisites

- Node.js 22 or newer.
- pnpm 10.34.3, as pinned by the root `packageManager` field.
- Python 3.14 for local development; the server package supports 3.13 and 3.14.
- uv for the locked Python environment.

You do not need to install pnpm globally. The commands below use the pinned
version through `npx`, which also avoids accidentally building with a different
pnpm release.

### Install dependencies

Run from the repository root:

```sh
npx pnpm@10.34.3 install
uv sync
```

For a clean, reproducible install that must match `pnpm-lock.yaml` exactly:

```sh
npx pnpm@10.34.3 install --frozen-lockfile
uv sync --frozen
```

### Start the web client

```sh
npx pnpm@10.34.3 dev:web
```

Vite prints the local URL when it starts, normally
`http://localhost:5173`. If that port is occupied, Vite selects another one.
The development server can remain open while you stage and commit changes in a
separate terminal.

### Start the application API

```sh
npx pnpm@10.34.3 dev:api
```

The initial API exposes `http://127.0.0.1:8000/health`, `/ready`, and `/docs`.
It does not require PostgreSQL until the catalog persistence increment.

Export the committed OpenAPI contract after changing an API model or route:

```sh
npx pnpm@10.34.3 contract:export
```

### Run the verification gate

Before committing a completed increment, run:

```sh
npx pnpm@10.34.3 typecheck:web
npx pnpm@10.34.3 format:check:api
npx pnpm@10.34.3 lint:api
npx pnpm@10.34.3 test:api
npx pnpm@10.34.3 test:web
npx pnpm@10.34.3 build:web
```

These commands perform the following checks:

1. `typecheck:web` validates the TypeScript project without producing a bundle.
2. `format:check:api` verifies deterministic Python formatting.
3. `lint:api` checks the Python process, shared modules, scripts, and tests.
4. `test:api` runs the Python API and contract suite.
5. `test:web` runs the Vitest unit and integration suite once.
6. `build:web` runs the TypeScript build and creates an optimized Vite bundle.

The production output is written to `apps/web/dist/`. That directory is
generated, ignored by Git, and should not be committed.

If the matching pnpm version is already installed and `pnpm --version` reports
`10.34.3`, the shorter `pnpm install`, `pnpm dev:web`, and other root scripts are
equivalent.

## Project documents

- [Project manifesto](docs/adrs/manifesto-v1.md)
- [Architecture Decision Records](docs/adrs/README.md)
- [Initial architecture](docs/architecture/initial-architecture.md)
- [Mobile core-flow design brief](docs/design/mobile-core-flow-v1.md)
- [Walking skeleton v1](docs/product/walking-skeleton-v1.md)
- [Media import implementation increments](docs/product/media-import-increments.md)
