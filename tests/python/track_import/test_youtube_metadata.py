import pytest
from utastream.track_import.youtube_metadata import (
    YouTubeMetadataError,
    parse_youtube_metadata,
)


def test_topic_channel_becomes_artist() -> None:
    metadata = parse_youtube_metadata(
        {"title": "家族の結末", "author_name": "österreich - Topic"}
    )

    assert metadata.title == "家族の結末"
    assert metadata.artist == "österreich"


def test_standard_music_title_takes_precedence_over_channel() -> None:
    metadata = parse_youtube_metadata(
        {
            "title": "Uta - Beyond the Night (Official Music Video)",
            "author_name": "Example Records",
        }
    )

    assert metadata.title == "Beyond the Night"
    assert metadata.artist == "Uta"


def test_invalid_provider_payload_is_rejected() -> None:
    with pytest.raises(YouTubeMetadataError):
        parse_youtube_metadata({"title": "Song"})
