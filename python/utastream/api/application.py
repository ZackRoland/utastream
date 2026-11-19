from fastapi import FastAPI

from utastream import __version__

from .errors import register_error_handlers
from .request_ids import RequestIdMiddleware
from .routes import library_router, lyrics_router, system_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="UtaStream API",
        summary="Application API for the UtaStream listening and learning experience.",
        version=__version__,
    )
    app.add_middleware(RequestIdMiddleware)
    register_error_handlers(app)
    app.include_router(system_router)
    app.include_router(lyrics_router)
    app.include_router(library_router)
    return app
