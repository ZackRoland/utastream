from fastapi.testclient import TestClient
from utastream.api import create_app


def test_health_reports_liveness_with_request_id() -> None:
    client = TestClient(create_app())

    response = client.get("/health", headers={"X-Request-ID": "test-request-1"})

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert response.headers["X-Request-ID"] == "test-request-1"


def test_readiness_reports_current_dependency_checks() -> None:
    client = TestClient(create_app())

    response = client.get("/ready")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ready",
        "checks": {"application": "ok"},
    }
    assert response.headers["X-Request-ID"]


def test_unknown_route_uses_shared_error_envelope() -> None:
    client = TestClient(create_app())

    response = client.get("/missing", headers={"X-Request-ID": "missing-route"})

    assert response.status_code == 404
    assert response.json() == {
        "error": {
            "code": "not_found",
            "message": "Not Found",
            "requestId": "missing-route",
        }
    }
    assert response.headers["X-Request-ID"] == "missing-route"


def test_unsafe_request_id_is_replaced() -> None:
    client = TestClient(create_app())

    response = client.get("/health", headers={"X-Request-ID": "unsafe request id"})

    assert response.status_code == 200
    assert response.headers["X-Request-ID"] != "unsafe request id"


def test_validation_error_uses_shared_error_envelope() -> None:
    app = create_app()

    @app.get("/requires-integer")
    def requires_integer(value: int) -> dict[str, int]:
        return {"value": value}

    client = TestClient(app)
    response = client.get(
        "/requires-integer",
        params={"value": "not-an-integer"},
        headers={"X-Request-ID": "invalid-input"},
    )

    assert response.status_code == 422
    assert response.json() == {
        "error": {
            "code": "validation_error",
            "message": "The request did not match the expected contract.",
            "requestId": "invalid-input",
        }
    }
    assert response.headers["X-Request-ID"] == "invalid-input"


def test_unexpected_error_is_safe_and_retains_request_id() -> None:
    app = create_app()

    @app.get("/explode")
    def explode() -> None:
        raise RuntimeError("sensitive implementation detail")

    client = TestClient(app, raise_server_exceptions=False)
    response = client.get(
        "/explode",
        headers={"X-Request-ID": "unexpected-error"},
    )

    assert response.status_code == 500
    assert response.json() == {
        "error": {
            "code": "internal_error",
            "message": "An unexpected error occurred.",
            "requestId": "unexpected-error",
        }
    }
    assert response.headers["X-Request-ID"] == "unexpected-error"
