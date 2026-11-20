import math

from fastapi import APIRouter, Query

from utastream.lyrics.lrc import LYRIC_NORMALIZATION_VERSION, parse_lrc
from utastream.lyrics.lrclib import (
    LrclibClient,
    LrclibError,
    LrclibOverloaded,
    LrclibRateLimited,
    LrclibTimeout,
)
from utastream.lyrics.matching import (
    MATCHING_POLICY_VERSION,
    MAX_CANDIDATE_RESULTS,
    CandidateMetadata,
    SearchMetadata,
    score_candidate,
)

from ..contracts import LyricCandidate, LyricCandidateResponse
from ..errors import error_responses

router = APIRouter(prefix="/v1/lyrics", tags=["lyrics"])
provider = LrclibClient()


@router.get(
    "/candidates",
    operation_id="getLyricCandidates",
    response_model=LyricCandidateResponse,
    responses=error_responses(422, 500),
)
def get_lyric_candidates(
    title: str = Query(min_length=1, max_length=300),
    artist: str = Query(min_length=1, max_length=300),
    duration_seconds: float | None = Query(default=None, gt=0, le=3600),
    album: str | None = Query(default=None, max_length=300),
) -> LyricCandidateResponse:
    source = SearchMetadata(
        title=title,
        artist=artist,
        duration_seconds=duration_seconds,
        album=album,
    )
    try:
        records = provider.search(title=title, artist=artist)
    except LrclibRateLimited as error:
        return LyricCandidateResponse(
            status="rate_limited",
            candidates=[],
            retry_after_seconds=error.retry_after_seconds,
        )
    except LrclibTimeout:
        return LyricCandidateResponse(status="timeout", candidates=[])
    except LrclibOverloaded as error:
        return LyricCandidateResponse(
            status="overloaded",
            candidates=[],
            retry_after_seconds=error.retry_after_seconds,
        )
    except LrclibError:
        return LyricCandidateResponse(status="unavailable", candidates=[])

    candidates: list[LyricCandidate] = []
    for record in records:
        scored = score_candidate(
            source,
            CandidateMetadata(
                title=record.track_name,
                artist=record.artist_name,
                album=record.album_name,
                duration_seconds=record.duration,
            ),
        )
        segments = parse_lrc(record.synced_lyrics)
        candidates.append(
            LyricCandidate(
                provider_record_id=str(record.id),
                title=record.track_name,
                artist=record.artist_name,
                album=record.album_name,
                duration_seconds=record.duration,
                duration_difference_seconds=(
                    abs(duration_seconds - record.duration)
                    if duration_seconds is not None
                    else None
                ),
                instrumental=record.instrumental,
                plain_lyrics=record.plain_lyrics,
                synced_lyrics=record.synced_lyrics,
                lyric_document_version=LYRIC_NORMALIZATION_VERSION,
                timing_type="line" if segments else None,
                normalized_segments=segments,
                rights_capabilities={
                    "status": "unknown",
                    "display": True,
                    "timedSynchronization": bool(segments),
                },
                score=scored.total,
                confidence_band=scored.band,
                warnings=list(scored.warnings),
                matching_policy_version=MATCHING_POLICY_VERSION,
            )
        )
    candidates.sort(key=lambda candidate: candidate.score, reverse=True)
    candidates = _unique_duration_candidates(candidates)
    return LyricCandidateResponse(
        status="ready" if candidates else "missing",
        candidates=candidates,
    )


def _unique_duration_candidates(
    candidates: list[LyricCandidate],
) -> list[LyricCandidate]:
    """Keep the best-ranked candidate for each displayed whole-second duration."""
    selected: list[LyricCandidate] = []
    seen_durations: set[int] = set()
    for candidate in candidates:
        duration_seconds = math.floor(candidate.duration_seconds + 0.5)
        if duration_seconds in seen_durations:
            continue
        seen_durations.add(duration_seconds)
        selected.append(candidate)
        if len(selected) == MAX_CANDIDATE_RESULTS:
            break
    return selected
