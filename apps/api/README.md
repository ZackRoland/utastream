# UtaStream API process

This directory contains only the FastAPI process entrypoint. Application,
contract, and capability code lives under `python/utastream/` so the future API
and worker processes can share it without becoming separate services.

From the repository root:

```sh
uv sync
uv run uvicorn apps.api.main:app --reload
```

The initial increment exposes deterministic `/health`, `/ready`, and OpenAPI
contracts without requiring PostgreSQL or external providers. Readiness gains
database and provider checks only when those dependencies participate in the
application.
