const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/
const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
])

export type YouTubeReference = {
  videoId: string
  normalizedUrl: string
}

export class InvalidYouTubeUrlError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidYouTubeUrlError"
  }
}

export function parseYouTubeUrl(input: string): YouTubeReference {
  let url: URL
  try {
    url = new URL(input.trim())
  } catch {
    throw new InvalidYouTubeUrlError("Enter a complete YouTube URL.")
  }

  if (url.protocol !== "https:") {
    throw new InvalidYouTubeUrlError("Use an https:// YouTube URL.")
  }
  if (url.username || url.password || url.port) {
    throw new InvalidYouTubeUrlError("The YouTube URL contains unsupported connection details.")
  }

  let videoId: string | null = null
  if (url.hostname === "youtu.be") {
    videoId = url.pathname.split("/").filter(Boolean)[0] ?? null
  } else if (YOUTUBE_HOSTS.has(url.hostname)) {
    if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v")
    } else {
      const [kind, candidate] = url.pathname.split("/").filter(Boolean)
      if (["embed", "shorts", "live"].includes(kind)) videoId = candidate ?? null
    }
  } else {
    throw new InvalidYouTubeUrlError("Use a youtube.com or youtu.be URL.")
  }

  if (!videoId || !VIDEO_ID_PATTERN.test(videoId)) {
    throw new InvalidYouTubeUrlError("The URL does not contain a valid video ID.")
  }

  return {
    videoId,
    normalizedUrl: `https://www.youtube.com/watch?v=${videoId}`,
  }
}
