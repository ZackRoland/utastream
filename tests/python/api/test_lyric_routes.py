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
    assert body["candidates"][0]["matchingPolicyVersion"] == "metadata-v2"
    assert body["candidates"][0]["lyricDocumentVersion"] == 2


def test_candidates_keep_best_per_rounded_duration_and_limit_to_ten(
    monkeypatch,
) -> None:
    records = [
        LrclibRecord(
            1,
            "Asphyxia",
            "Cö shu Nie",
            "Asphyxia",
            179.1,
            False,
            "best",
            "[00:01] best",
        ),
        LrclibRecord(
            2,
            "Other",
            "Nobody",
            None,
            179.4,
            False,
            "duplicate",
            "[00:01] duplicate",
        ),
        *[
            LrclibRecord(
                record_id,
                f"Asphyxia {record_id}",
                "Cö shu Nie",
                None,
                float(178 + record_id),
                False,
                "lyrics",
                "[00:01] lyrics",
            )
            for record_id in range(3, 15)
        ],
    ]
    monkeypatch.setattr(lyric_routes, "provider", StubProvider(records))

    response = TestClient(create_app()).get(
        "/v1/lyrics/candidates",
        params={
            "title": "Asphyxia",
            "artist": "Cö shu Nie",
            "duration_seconds": 179,
        },
    )

    candidates = response.json()["candidates"]
    assert len(candidates) == 10
    assert candidates[0]["providerRecordId"] == "1"
    assert "2" not in {candidate["providerRecordId"] for candidate in candidates}
    rounded_durations = [
        round(candidate["durationSeconds"]) for candidate in candidates
    ]
    assert len(rounded_durations) == len(set(rounded_durations))


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
