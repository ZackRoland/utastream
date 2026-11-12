from fastapi.testclient import TestClient
from utastream.api.application import create_app
from utastream.api.routes import lyrics as lyric_routes
from utastream.lyrics.lrclib import LrclibRateLimited, LrclibRecord, LrclibTimeout


class StubProvider:
    def __init__(self, result):
        self.result = result

    def search(self, **_kwargs):
        if isinstance(self.result, Exception):
            raise self.result
        return self.result


def test_candidates_are_ranked_and_include_policy(monkeypatch) -> None:
    monkeypatch.setattr(
        lyric_routes,
        "provider",
        StubProvider(
            [
                LrclibRecord(2, "Other", "Nobody", None, 400, False, "x", None),
                LrclibRecord(
                    1,
                    "夜の向こう",
                    "Uta",
                    "Blue",
                    180,
                    False,
                    "歌",
                    "[00:01] 歌",
                ),
            ]
        ),
    )
    response = TestClient(create_app()).get(
        "/v1/lyrics/candidates",
        params={"title": "夜の向こう", "artist": "Uta", "duration_seconds": 180},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ready"
    assert body["candidates"][0]["providerRecordId"] == "1"
    assert body["candidates"][0]["matchingPolicyVersion"] == "metadata-v1"


def test_rate_limit_is_a_distinct_recoverable_state(monkeypatch) -> None:
    monkeypatch.setattr(
        lyric_routes,
        "provider",
        StubProvider(LrclibRateLimited("wait", retry_after_seconds=12)),
    )
    response = TestClient(create_app()).get(
        "/v1/lyrics/candidates", params={"title": "Song", "artist": "Artist"}
    )

    assert response.json() == {
        "status": "rate_limited",
        "candidates": [],
        "retryAfterSeconds": 12,
    }


def test_timeout_is_a_distinct_recoverable_state(monkeypatch) -> None:
    monkeypatch.setattr(
        lyric_routes,
        "provider",
        StubProvider(LrclibTimeout("timed out")),
    )
    response = TestClient(create_app()).get(
        "/v1/lyrics/candidates", params={"title": "Song", "artist": "Artist"}
    )

    assert response.json()["status"] == "timeout"
