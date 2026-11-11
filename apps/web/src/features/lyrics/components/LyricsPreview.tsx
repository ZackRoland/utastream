import type { RefObject } from "react"

import { findActiveSegmentIndex } from "../lib/findActiveSegmentIndex"
import type { LyricDocument } from "../model/lyricDocument"
import { JapaneseText } from "./JapaneseText"
import styles from "./LyricsPreview.module.css"

type LyricsPreviewProps = {
  document: LyricDocument
  currentTimeSeconds: number
  onOpen: () => void
  openButtonRef?: RefObject<HTMLButtonElement | null>
}
export function LyricsPreview({
  document,
  currentTimeSeconds,
  onOpen,
  openButtonRef,
}: LyricsPreviewProps) {
  const activeIndex = findActiveSegmentIndex(document, currentTimeSeconds)
  const upcomingIndex = document.segments.findIndex(
    (segment) => segment.startSeconds > currentTimeSeconds,
  )
  const displayIndex =
    activeIndex >= 0
      ? activeIndex
      : upcomingIndex >= 0
        ? upcomingIndex
        : Math.max(0, document.segments.length - 1)
  const firstVisibleIndex = Math.max(0, displayIndex - 1)
  const visibleSegments = document.segments.slice(
    firstVisibleIndex,
    displayIndex + 2,
  )

  return (
    <section className={styles.preview} aria-labelledby="lyrics-preview-title">
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>Following playback</span>
          <h2 id="lyrics-preview-title">Lyrics</h2>
        </div>
        <button
          ref={openButtonRef}
          className={styles.openButton}
          type="button"
          onClick={onOpen}
        >
          Open lyrics
        </button>
      </div>

      <div className={styles.lines} aria-live="off">
        {visibleSegments.map((segment) => {
          const isActive = segment.id === document.segments[activeIndex]?.id

          return (
            <p
              className={isActive ? styles.currentLine : styles.line}
              key={segment.id}
              aria-current={isActive ? "true" : undefined}
            >
              <JapaneseText parts={segment.parts} />
              {isActive && <span className={styles.liveMarker}>Live</span>}
            </p>
          )
        })}
      </div>

      <p className={styles.hint}>
        Stay with the music. Get closer to the words.
      </p>
    </section>
  )
}
