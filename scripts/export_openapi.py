import json
import sys
from pathlib import Path

from utastream.api import create_app

REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
OPENAPI_PATH = REPOSITORY_ROOT / "packages" / "api-contract" / "openapi.json"


def main() -> None:
    document = create_app().openapi()
    generated = (
        json.dumps(document, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    )

    if "--check" in sys.argv:
        committed = (
            OPENAPI_PATH.read_text(encoding="utf-8") if OPENAPI_PATH.exists() else ""
        )
        if committed != generated:
            raise SystemExit(
                "OpenAPI contract is stale. Run `pnpm contract:generate` and commit "
                "the generated artifacts."
            )
        return

    OPENAPI_PATH.parent.mkdir(parents=True, exist_ok=True)
    OPENAPI_PATH.write_text(generated, encoding="utf-8")


if __name__ == "__main__":
    main()
