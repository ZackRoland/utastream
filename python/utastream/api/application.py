from fastapi import FastAPI

from utastream import __version__

from .errors import register_error_handlers
from .request_ids import RequestIdMiddleware
from .routes import system_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="UtaStream API",
        summary="Application API for the UtaStream listening and learning experience.",
        version=__version__,
    )
    app.add_middleware(RequestIdMiddleware)
    register_error_handlers(app)
    app.include_router(system_router)
    return app
