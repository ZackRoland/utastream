from fastapi.testclient import TestClient
from utastream.api.application import create_app
from utastream.api.routes import youtube as youtube_routes
from utastream.track_import.youtube_metadata import (
    YouTubeMetadata,
    YouTubeMetadataError,
)


class StubProvider:
    def __init__(self, result):
        self.result = result

    def get(self, _video_id):
        if isinstance(self.result, Exception):
            raise self.result
        return self.result


def test_returns_normalized_youtube_metadata(monkeypatch) -> None:
    monkeypatch.setattr(
        youtube_routes,
        "provider",
        StubProvider(
            YouTubeMetadata(
                title="家族の結末",
                artist="österreich",
                provider_title="家族の結末",
                provider_author="österreich - Topic",
            )
        ),
    )

    response = TestClient(create_app()).get(
        "/v1/youtube/metadata", params={"video_id": "RpSb3zemrrA"}
    )

    assert response.status_code == 200
    assert response.json() == {
        "status": "ready",
        "title": "家族の結末",
        "artist": "österreich",
        "providerTitle": "家族の結末",
        "providerAuthor": "österreich - Topic",
    }


def test_provider_failure_is_recoverable(monkeypatch) -> None:
    monkeypatch.setattr(
        youtube_routes,
        "provider",
        StubProvider(YouTubeMetadataError("unavailable")),
    )

    response = TestClient(create_app()).get(
        "/v1/youtube/metadata", params={"video_id": "RpSb3zemrrA"}
    )

    assert response.json()["status"] == "unavailable"
