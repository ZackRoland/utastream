# UtaStream API process

This directory contains only the FastAPI process entrypoint. Application,
contract, and capability code lives under `python/utastream/` so the future API
and worker processes can share it without becoming separate services.

From the repository root:

```sh
uv sync
uv run uvicorn apps.api.main:app --reload
```

`/health`, `/ready`, and OpenAPI remain available without external provider
calls. Library, learning, and import-completion routes require the migrated
PostgreSQL URL in `UTASTREAM_DATABASE_URL`. Lyric lookup contacts LRCLIB only
after a user explicitly starts a search.
