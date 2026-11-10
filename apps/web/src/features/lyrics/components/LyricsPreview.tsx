import { findActiveSegmentIndex } from "../lib/findActiveSegmentIndex"
import type { LyricDocument, LyricPart } from "../model/lyricDocument"
import styles from "./LyricsPreview.module.css"

type LyricsPreviewProps = {
  document: LyricDocument
  currentTimeSeconds: number
}

function JapaneseLine({ parts }: { parts: LyricPart[] }) {
  return <>{parts.map((part) => part.text).join("")}</>
}

export function LyricsPreview({
  document,
  currentTimeSeconds,
}: LyricsPreviewProps) {
  const activeIndex = findActiveSegmentIndex(document, currentTimeSeconds)
  const firstVisibleIndex = Math.max(0, activeIndex - 1)
  const visibleSegments = document.segments.slice(
    firstVisibleIndex,
    activeIndex + 2,
  )

  return (
    <section className={styles.preview} aria-labelledby="lyrics-preview-title">
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>Following playback</span>
          <h2 id="lyrics-preview-title">Lyrics</h2>
        </div>
        <span className={styles.previewLabel}>Preview</span>
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
              <JapaneseLine parts={segment.parts} />
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
