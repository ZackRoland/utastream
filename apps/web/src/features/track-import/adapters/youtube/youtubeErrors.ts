export type YouTubeAvailabilityError = {
  code:
    | "invalid_video"
    | "playback_failed"
    | "unavailable"
    | "not_embeddable"
    | "client_identity_required"
  message: string
  recoverable: true
}

export function mapYouTubePlayerError(code: number): YouTubeAvailabilityError {
  switch (code) {
    case 2:
      return {
        code: "invalid_video",
        message: "YouTube rejected this video reference. Check the URL and try again.",
        recoverable: true,
      }
    case 100:
      return {
        code: "unavailable",
        message: "This video is private, removed, or otherwise unavailable.",
        recoverable: true,
      }
    case 101:
    case 150:
      return {
        code: "not_embeddable",
        message: "The video owner does not allow playback in embedded players.",
        recoverable: true,
      }
    case 153:
      return {
        code: "client_identity_required",
        message:
          "YouTube could not identify this application request. Check the deployment referrer configuration.",
        recoverable: true,
      }
    default:
      return {
        code: "playback_failed",
        message: "YouTube could not prepare this video for embedded playback.",
        recoverable: true,
      }
  }
}
