# API Contract

This workspace package contains UtaStream's committed HTTP boundary artifacts:

- `openapi.json` is deterministically exported from FastAPI and Pydantic.
- `src/generated.ts` is generated from that document by the pinned
  `openapi-typescript` dependency.

Neither artifact should be edited manually. From the repository root, run:

```sh
pnpm contract:generate
```

`pnpm contract:check` compares both committed artifacts with freshly generated
content and exits unsuccessfully on drift. The package exports types only; the
web application owns fetch configuration and runtime behavior.
