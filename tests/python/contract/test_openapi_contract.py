import json
from pathlib import Path

from utastream.api import create_app

REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
OPENAPI_PATH = REPOSITORY_ROOT / "packages" / "api-contract" / "openapi.json"


def test_committed_openapi_matches_application() -> None:
    committed = json.loads(OPENAPI_PATH.read_text(encoding="utf-8"))

    assert committed == create_app().openapi()


def test_system_operations_have_stable_identifiers_and_errors() -> None:
    document = create_app().openapi()

    assert document["paths"]["/health"]["get"]["operationId"] == "getHealth"
    assert document["paths"]["/ready"]["get"]["operationId"] == "getReadiness"
    assert "500" in document["paths"]["/health"]["get"]["responses"]
    assert "503" in document["paths"]["/ready"]["get"]["responses"]
