import json
import re
from dataclasses import dataclass
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


class YouTubeMetadataError(Exception):
    pass


@dataclass(frozen=True)
class YouTubeMetadata:
    title: str
    artist: str
    provider_title: str
    provider_author: str


class YouTubeMetadataClient:
    def __init__(self, *, timeout_seconds: float = 8) -> None:
        self._timeout_seconds = timeout_seconds

    def get(self, video_id: str) -> YouTubeMetadata:
        query = urlencode(
            {
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "format": "json",
            }
        )
        request = Request(
            f"https://www.youtube.com/oembed?{query}",
            headers={"User-Agent": "UtaStream/0.1 (local development)"},
        )
        try:
            with urlopen(request, timeout=self._timeout_seconds) as response:
                payload = json.load(response)
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as error:
            raise YouTubeMetadataError("YouTube metadata is unavailable.") from error

        return parse_youtube_metadata(payload)


def parse_youtube_metadata(value: Any) -> YouTubeMetadata:
    if not isinstance(value, dict):
        raise YouTubeMetadataError("YouTube returned invalid metadata.")
    provider_title = value.get("title")
    provider_author = value.get("author_name")
    if not isinstance(provider_title, str) or not provider_title.strip():
        raise YouTubeMetadataError("YouTube returned invalid metadata.")
    if not isinstance(provider_author, str) or not provider_author.strip():
        raise YouTubeMetadataError("YouTube returned invalid metadata.")

    title = provider_title.strip()
    artist = _clean_channel_name(provider_author)
    title_parts = re.split(r"\s+[-\u2013\u2014]\s+", title, maxsplit=1)
    if len(title_parts) == 2 and all(part.strip() for part in title_parts):
        artist = title_parts[0].strip()
        title = _strip_presentation_suffix(title_parts[1].strip())

    return YouTubeMetadata(
        title=title,
        artist=artist,
        provider_title=provider_title.strip(),
        provider_author=provider_author.strip(),
    )


def _clean_channel_name(author: str) -> str:
    return re.sub(r"\s+-\s+Topic$", "", author.strip(), flags=re.IGNORECASE)


def _strip_presentation_suffix(title: str) -> str:
    presentation = (
        r"official\s+(?:music\s+)?video|official\s+audio|lyrics?|lyric\s+video|"
        r"music\s+video|mv|visuali[sz]er"
    )
    cleaned = re.sub(
        rf"\s*[\[(](?:{presentation})[\])]?\s*$",
        "",
        title,
        flags=re.IGNORECASE,
    )
    return cleaned.strip()
