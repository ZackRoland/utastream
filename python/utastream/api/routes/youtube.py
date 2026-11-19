from fastapi import APIRouter, Query

from utastream.track_import.youtube_metadata import (
    YouTubeMetadataClient,
    YouTubeMetadataError,
)

from ..contracts import YouTubeMetadataResponse
from ..errors import error_responses

router = APIRouter(prefix="/v1/youtube", tags=["youtube"])
provider = YouTubeMetadataClient()


@router.get(
    "/metadata",
    operation_id="getYouTubeMetadata",
    response_model=YouTubeMetadataResponse,
    responses=error_responses(422, 500),
)
def get_youtube_metadata(
    video_id: str = Query(pattern=r"^[A-Za-z0-9_-]{11}$"),
) -> YouTubeMetadataResponse:
    try:
        metadata = provider.get(video_id)
    except YouTubeMetadataError:
        return YouTubeMetadataResponse(status="unavailable")
    return YouTubeMetadataResponse(
        status="ready",
        title=metadata.title,
        artist=metadata.artist,
        provider_title=metadata.provider_title,
        provider_author=metadata.provider_author,
    )
