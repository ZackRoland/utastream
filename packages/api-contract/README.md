# UtaStream API contract

`openapi.json` is generated from the FastAPI application and committed for
review and client generation. It must not be edited manually.

Generate it from the repository root:

```sh
uv run python scripts/export_openapi.py
```

Generated TypeScript types and the application-owned fetch transport arrive in
the dedicated contract increment defined by ADR-0005.
