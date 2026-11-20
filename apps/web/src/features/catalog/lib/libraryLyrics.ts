import type { LyricDocument, LyricSegment } from "../../lyrics/model/lyricDocument"
import type { LibraryTrack } from "../api/libraryApi"

export function toLyricDocument(track: LibraryTrack): LyricDocument | null {
  if (!track.lyrics) return null

  const segments = track.lyrics.segments.flatMap((value, index) => {
    const segment = toLyricSegment(value, index, track)
    return segment ? [segment] : []
  })
  if (!segments.length) return null

  return {
    id: track.lyrics.id,
    trackId: track.trackId,
    version: track.lyrics.version,
    language: "ja",
    segments,
  }
}

function toLyricSegment(
  value: Record<string, unknown>,
  index: number,
  track: LibraryTrack,
): LyricSegment | null {
  const startSeconds = value.startSeconds
  const text = value.text
  if (
    typeof startSeconds !== "number" ||
    typeof text !== "string" ||
    !text.trim()
  ) return null

  const offsetSeconds = (track.lyrics?.timingOffsetMs ?? 0) / 1000
  const next = track.lyrics?.segments[index + 1]?.startSeconds
  const providerEnd = value.endSeconds
  const endSeconds =
    typeof providerEnd === "number"
      ? providerEnd
      : typeof next === "number"
        ? next
        : track.durationSeconds

  return {
    id: `${track.lyrics?.id ?? track.trackId}:${index}`,
    startSeconds: Math.max(0, startSeconds + offsetSeconds),
    endSeconds: Math.max(
      Math.max(0, startSeconds + offsetSeconds),
      endSeconds + offsetSeconds,
    ),
    parts: [{ text: text.trim() }],
    translation: "",
  }
}
