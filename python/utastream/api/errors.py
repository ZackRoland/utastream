import logging
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHttpException

from .contracts import ErrorDetail, ErrorEnvelope
from .request_ids import REQUEST_ID_HEADER

logger = logging.getLogger(__name__)


def _request_id(request: Request) -> str:
    return getattr(request.state, "request_id", "unavailable")


def _error_response(
    request: Request,
    *,
    status_code: int,
    code: str,
    message: str,
) -> JSONResponse:
    request_id = _request_id(request)
    body = ErrorEnvelope(
        error=ErrorDetail(
            code=code,
            message=message,
            request_id=request_id,
        )
    )
    return JSONResponse(
        status_code=status_code,
        content=body.model_dump(mode="json", by_alias=True),
        headers={REQUEST_ID_HEADER: request_id},
    )


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(StarletteHttpException)
    async def handle_http_error(
        request: Request,
        exception: StarletteHttpException,
    ) -> JSONResponse:
        if isinstance(exception.detail, str):
            message = exception.detail
        else:
            message = "Request failed."
        code = "not_found" if exception.status_code == 404 else "http_error"
        return _error_response(
            request,
            status_code=exception.status_code,
            code=code,
            message=message,
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(
        request: Request,
        _exception: RequestValidationError,
    ) -> JSONResponse:
        return _error_response(
            request,
            status_code=422,
            code="validation_error",
            message="The request did not match the expected contract.",
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(
        request: Request,
        exception: Exception,
    ) -> JSONResponse:
        logger.error(
            "Unhandled API error request_id=%s",
            _request_id(request),
            exc_info=(type(exception), exception, exception.__traceback__),
        )
        return _error_response(
            request,
            status_code=500,
            code="internal_error",
            message="An unexpected error occurred.",
        )


def error_responses(*status_codes: int) -> dict[int | str, dict[str, Any]]:
    return {
        status_code: {
            "model": ErrorEnvelope,
            "description": "Error response",
        }
        for status_code in status_codes
    }
