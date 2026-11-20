from copy import deepcopy
from uuid import UUID

from fastapi.testclient import TestClient
from utastream.api.application import create_app

USER_ID = "00000000-0000-0000-0000-000000000001"


def _request() -> dict:
    return {
        "userId": USER_ID,
        "title": "夜の向こう",
        "artist": "Uta",
        "album": "Blue",
        "source": {
            "kind": "local_file",
            "availability": "local_file_required",
            "externalId": None,
            "normalizedUrl": None,
            "durationSeconds": 180,
            "originalMetadata": {"filename": "night.mp3"},
            "capabilities": {"supportsSeeking": True},
            "provenance": {"provider": "local_file"},
        },
        "lyrics": {
            "providerRecordId": "42",
            "lyricDocumentVersion": 1,
            "normalizedSegments": [
                {"startSeconds": 1, "endSeconds": None, "text": "夜の向こう"}
            ],
            "attribution": "Lyrics supplied by LRCLIB",
            "rightsCapabilities": {"status": "unknown", "display": True},
            "score": 98,
            "matchingPolicyVersion": "metadata-v1",
            "confirmedAt": "2026-11-11T00:00:00Z",
            "timingOffsetMs": 250,
            "durationDifferenceSeconds": 1,
        },
    }


def test_two_source_imports_reuse_track_library_and_lyrics_across_restart(
    migrated_database_url: str,
    monkeypatch,
) -> None:
    monkeypatch.setenv("UTASTREAM_DATABASE_URL", migrated_database_url)
    first_client = TestClient(create_app())
    local_response = first_client.post("/v1/track-imports", json=_request())
    assert local_response.status_code == 200
    local = local_response.json()
    assert local["trackCreated"] is True
    assert local["libraryItemCreated"] is True
    assert local["item"]["sources"][0]["availability"] == "local_file_required"
    learning_response = first_client.post(
        "/v1/learning-items",
        json={
            "userId": USER_ID,
            "trackId": local["item"]["trackId"],
            "lyricDocumentId": local["item"]["lyrics"]["id"],
            "segmentKey": "segment-1",
            "selectedText": "向こう",
            "selectionKind": "expression",
        },
    )
    assert learning_response.status_code == 200
    learning_id = learning_response.json()["id"]

    youtube_request = deepcopy(_request())
    youtube_request["source"] = {
        "kind": "youtube",
        "availability": "available",
        "externalId": "M7lc1UVf-VE",
        "normalizedUrl": "https://www.youtube.com/watch?v=M7lc1UVf-VE",
        "durationSeconds": 181,
        "originalMetadata": {},
        "capabilities": {"requiresVisiblePlayer": True},
        "provenance": {"provider": "youtube"},
    }
    second_client = TestClient(create_app())
    youtube_response = second_client.post("/v1/track-imports", json=youtube_request)
    assert youtube_response.status_code == 200
    youtube = youtube_response.json()
    assert youtube["trackCreated"] is False
    assert youtube["libraryItemCreated"] is False
    assert youtube["sourceCreated"] is True
    assert youtube["item"]["trackId"] == local["item"]["trackId"]
    assert youtube["item"]["libraryItemId"] == local["item"]["libraryItemId"]
    youtube_source = next(
        source for source in youtube["item"]["sources"] if source["kind"] == "youtube"
    )
    assert youtube["item"]["preferredSourceId"] == youtube_source["id"]
    assert {source["kind"] for source in youtube["item"]["sources"]} == {
        "local_file",
        "youtube",
    }

    restarted_client = TestClient(create_app())
    library_response = restarted_client.get(f"/v1/users/{USER_ID}/library")
    assert library_response.status_code == 200
    items = library_response.json()["items"]
    assert len(items) == 1
    assert UUID(items[0]["trackId"]) == UUID(local["item"]["trackId"])
    assert items[0]["lyrics"]["sourceRecordId"] == "42"
    assert items[0]["lyrics"]["version"] == 1
    learning_items = restarted_client.get(f"/v1/users/{USER_ID}/learning-items").json()[
        "items"
    ]
    assert len(learning_items) == 1
    assert learning_items[0]["id"] == learning_id
    assert learning_items[0]["trackId"] == items[0]["trackId"]


def test_replacing_source_lyrics_survives_reload_and_preserves_learning(
    migrated_database_url: str,
    monkeypatch,
) -> None:
    monkeypatch.setenv("UTASTREAM_DATABASE_URL", migrated_database_url)
    client = TestClient(create_app())
    imported = client.post("/v1/track-imports", json=_request()).json()["item"]
    original_document_id = imported["lyrics"]["id"]
    source_id = imported["preferredSourceId"]
    saved = client.post(
        "/v1/learning-items",
        json={
            "userId": USER_ID,
            "trackId": imported["trackId"],
            "lyricDocumentId": original_document_id,
            "segmentKey": "segment-1",
            "selectedText": "向こう",
            "selectionKind": "expression",
        },
    ).json()
    replacement = deepcopy(_request()["lyrics"])
    replacement.update(
        {
            "providerRecordId": "84",
            "normalizedSegments": [
                {
                    "startSeconds": 3,
                    "endSeconds": None,
                    "text": "正しい歌詞",
                }
            ],
            "score": 96,
            "matchingPolicyVersion": "metadata-v2",
            "timingOffsetMs": 750,
        }
    )

    response = client.put(
        f"/v1/users/{USER_ID}/library/{imported['trackId']}/sources/{source_id}/lyrics",
        json={"lyrics": replacement},
    )

    assert response.status_code == 200
    changed = response.json()["item"]
    assert changed["trackId"] == imported["trackId"]
    assert changed["preferredSourceId"] == source_id
    assert changed["sources"] == imported["sources"]
    assert changed["lyrics"]["sourceRecordId"] == "84"
    assert changed["lyrics"]["version"] == imported["lyrics"]["version"] + 1
    assert changed["lyrics"]["timingOffsetMs"] == 750
    assert changed["lyrics"]["playbackSourceId"] == source_id

    reloaded = (
        TestClient(create_app()).get(f"/v1/users/{USER_ID}/library").json()["items"][0]
    )
    assert reloaded["lyrics"] == changed["lyrics"]
    learning_items = client.get(f"/v1/users/{USER_ID}/learning-items").json()["items"]
    assert learning_items == [saved]
    assert learning_items[0]["lyricDocumentId"] == original_document_id


def test_library_reads_lyrics_for_preferred_source_not_latest_track_document(
    migrated_database_url: str,
    monkeypatch,
) -> None:
    monkeypatch.setenv("UTASTREAM_DATABASE_URL", migrated_database_url)
    client = TestClient(create_app())
    local = client.post("/v1/track-imports", json=_request()).json()["item"]
    local_source_id = local["preferredSourceId"]
    replacement = deepcopy(_request()["lyrics"])
    replacement.update(
        {
            "providerRecordId": "84",
            "normalizedSegments": [
                {"startSeconds": 3, "endSeconds": None, "text": "ローカル版"}
            ],
            "timingOffsetMs": 500,
        }
    )
    changed_local = client.put(
        f"/v1/users/{USER_ID}/library/{local['trackId']}"
        f"/sources/{local_source_id}/lyrics",
        json={"lyrics": replacement},
    ).json()["item"]
    assert changed_local["lyrics"]["sourceRecordId"] == "84"

    youtube_request = deepcopy(_request())
    youtube_request["source"] = {
        "kind": "youtube",
        "availability": "available",
        "externalId": "M7lc1UVf-VE",
        "normalizedUrl": "https://www.youtube.com/watch?v=M7lc1UVf-VE",
        "durationSeconds": 181,
        "originalMetadata": {},
        "capabilities": {"requiresVisiblePlayer": True},
        "provenance": {"provider": "youtube"},
    }
    youtube = client.post("/v1/track-imports", json=youtube_request).json()["item"]

    assert youtube["preferredSourceId"] != local_source_id
    assert youtube["lyrics"]["playbackSourceId"] == youtube["preferredSourceId"]
    assert youtube["lyrics"]["sourceRecordId"] == "42"
    assert youtube["lyrics"]["timingOffsetMs"] == 250
    reloaded = client.get(f"/v1/users/{USER_ID}/library").json()["items"][0]
    assert reloaded["lyrics"]["sourceRecordId"] == "42"
