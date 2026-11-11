import type { LyricDocument } from "../model/lyricDocument"

export function findActiveSegmentIndex(
  document: LyricDocument,
  currentTimeSeconds: number,
) {
  if (document.segments.length === 0) return -1

  return document.segments.findIndex(
    (segment) =>
      segment.startSeconds <= currentTimeSeconds &&
      currentTimeSeconds < segment.endSeconds,
  )
}
