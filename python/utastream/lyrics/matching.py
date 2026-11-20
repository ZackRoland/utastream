"""Versioned metadata normalization and lyric-candidate scoring."""

import re
import unicodedata
from dataclasses import dataclass
from difflib import SequenceMatcher

MATCHING_POLICY_VERSION = "metadata-v2"
MAX_CANDIDATE_RESULTS = 10


@dataclass(frozen=True, slots=True)
class SearchMetadata:
    title: str
    artist: str
    duration_seconds: float | None = None
    album: str | None = None


@dataclass(frozen=True, slots=True)
class CandidateMetadata:
    title: str
    artist: str
    duration_seconds: float
    album: str | None = None


@dataclass(frozen=True, slots=True)
class MatchScore:
    total: int
    title: int
    artist: int
    duration: int
    album: int
    band: str
    warnings: tuple[str, ...]


_PRESENTATION_TEXT = re.compile(
    r"\b(?:official\s+(?:music\s+)?video|official\s+mv|music\s+video|mv)\b",
    re.IGNORECASE,
)
_EDITION_TEXT = re.compile(
    r"\b(?:live|acoustic|remix|remaster(?:ed)?|instrumental|sped[ -]?up|"
    r"short(?:ened)?|anime edit|cover)\b",
    re.IGNORECASE,
)
_FEATURE_TEXT = re.compile(r"\b(?:feat\.?|ft\.?)\b", re.IGNORECASE)
_NON_WORD = re.compile(r"[^\w\u3040-\u30ff\u3400-\u9fff]+", re.UNICODE)


def normalize_search_text(value: str) -> str:
    normalized = unicodedata.normalize("NFKC", value).casefold()
    normalized = _PRESENTATION_TEXT.sub(" ", normalized)
    normalized = _FEATURE_TEXT.sub(" ", normalized)
    return " ".join(_NON_WORD.sub(" ", normalized).split())


def score_candidate(source: SearchMetadata, candidate: CandidateMetadata) -> MatchScore:
    title = _similarity(source.title, candidate.title, 35)
    artist = _similarity(source.artist, candidate.artist, 30)
    duration = _duration_score(source.duration_seconds, candidate.duration_seconds)
    album = _similarity(source.album, candidate.album, 10) if source.album else 10
    total = title + artist + duration + album
    warnings: list[str] = []

    source_qualifiers = set(_EDITION_TEXT.findall(source.title))
    candidate_qualifiers = set(_EDITION_TEXT.findall(candidate.title))
    if source_qualifiers != candidate_qualifiers and (
        source_qualifiers or candidate_qualifiers
    ):
        warnings.append("Edition or performance qualifiers differ.")
    if (
        source.duration_seconds is not None
        and abs(source.duration_seconds - candidate.duration_seconds) > 10
    ):
        warnings.append("Duration differs by more than 10 seconds.")

    band = "strong" if total >= 90 else "ambiguous" if total >= 70 else "weak"
    return MatchScore(
        total=total,
        title=title,
        artist=artist,
        duration=duration,
        album=album,
        band=band,
        warnings=tuple(warnings),
    )


def _similarity(left: str | None, right: str | None, weight: int) -> int:
    if not left or not right:
        return 0
    ratio = SequenceMatcher(
        None, normalize_search_text(left), normalize_search_text(right)
    ).ratio()
    return round(ratio * weight)


def _duration_score(source: float | None, candidate: float) -> int:
    if source is None:
        return 0
    difference = abs(source - candidate)
    if difference <= 2:
        return 25
    if difference >= 30:
        return 0
    return round(25 * (30 - difference) / 28)
