import type { LyricDocument } from "../model/lyricDocument"

export function findActiveSegmentIndex(
  document: LyricDocument,
  currentTimeSeconds: number,
) {
  if (document.segments.length === 0) return -1

  let activeIndex = -1

  for (const [index, segment] of document.segments.entries()) {
    if (segment.startSeconds > currentTimeSeconds) break
    activeIndex = index
  }

  return Math.max(0, activeIndex)
}
