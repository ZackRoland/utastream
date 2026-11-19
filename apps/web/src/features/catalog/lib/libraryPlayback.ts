import type { LibraryTrack } from "../api/libraryApi"

export type LibraryPlaybackSource = LibraryTrack["sources"][number]

export function getPlayableYouTubeSource(
  item: LibraryTrack,
): (LibraryPlaybackSource & { externalId: string }) | null {
  const preferred = item.sources.find(
    (source) => source.id === item.preferredSourceId,
  )
  if (isPlayableYouTubeSource(preferred)) return preferred
  return item.sources.find(isPlayableYouTubeSource) ?? null
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`
}

function isPlayableYouTubeSource(
  source: LibraryPlaybackSource | undefined,
): source is LibraryPlaybackSource & { externalId: string } {
  return (
    source?.kind === "youtube" &&
    source.availability === "available" &&
    typeof source.externalId === "string" &&
    source.externalId.length > 0
  )
}
