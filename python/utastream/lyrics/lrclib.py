"""Small LRCLIB boundary with bounded calls and provider error mapping."""

import json
from dataclasses import dataclass
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


class LrclibError(Exception):
    code = "unavailable"

    def __init__(self, message: str, retry_after_seconds: int | None = None) -> None:
        super().__init__(message)
        self.retry_after_seconds = retry_after_seconds


class LrclibOverloaded(LrclibError):
    code = "overloaded"


class LrclibRateLimited(LrclibError):
    code = "rate_limited"


class LrclibTimeout(LrclibError):
    code = "timeout"


@dataclass(frozen=True, slots=True)
class LrclibRecord:
    id: int
    track_name: str
    artist_name: str
    album_name: str | None
    duration: float
    instrumental: bool
    plain_lyrics: str | None
    synced_lyrics: str | None


class LrclibClient:
    def __init__(
        self,
        *,
        base_url: str = "https://lrclib.net",
        client_identity: str = "UtaStream/0.1 (local development)",
        timeout_seconds: float = 8,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._client_identity = client_identity
        self._timeout_seconds = timeout_seconds

    def search(self, *, title: str, artist: str) -> list[LrclibRecord]:
        query = urlencode({"track_name": title, "artist_name": artist})
        request = Request(
            f"{self._base_url}/api/search?{query}",
            headers={
                "Accept": "application/json",
                "User-Agent": self._client_identity,
            },
        )
        try:
            with urlopen(request, timeout=self._timeout_seconds) as response:
                payload = json.load(response)
        except HTTPError as error:
            retry_after = _retry_after(error.headers.get("Retry-After"))
            if error.code == 429:
                raise LrclibRateLimited(
                    "Lyric lookup is rate limited. Try again later.", retry_after
                ) from error
            if error.code == 503:
                raise LrclibOverloaded(
                    "The lyric provider is temporarily overloaded.", retry_after
                ) from error
            raise LrclibError("The lyric provider rejected the lookup.") from error
        except TimeoutError as error:
            raise LrclibTimeout("Lyric lookup timed out.") from error
        except (URLError, OSError, ValueError) as error:
            raise LrclibError("The lyric provider is unavailable.") from error

        if not isinstance(payload, list):
            raise LrclibError("The lyric provider returned an invalid response.")
        return [_parse_record(item) for item in payload[:20]]


def _parse_record(value: Any) -> LrclibRecord:
    if not isinstance(value, dict):
        raise LrclibError("The lyric provider returned an invalid record.")
    try:
        return LrclibRecord(
            id=int(value["id"]),
            track_name=str(value["trackName"]),
            artist_name=str(value["artistName"]),
            album_name=str(value["albumName"]) if value.get("albumName") else None,
            duration=float(value["duration"]),
            instrumental=bool(value["instrumental"]),
            plain_lyrics=value.get("plainLyrics"),
            synced_lyrics=value.get("syncedLyrics"),
        )
    except (KeyError, TypeError, ValueError) as error:
        raise LrclibError("The lyric provider returned an invalid record.") from error


def _retry_after(value: str | None) -> int | None:
    try:
        return max(0, int(value)) if value is not None else None
    except ValueError:
        return None
