import { useEffect, useRef, useState } from "react"

import { Icon } from "../../../shared/ui/Icon"
import { formatPlaybackTime } from "../../playback/lib/formatPlaybackTime"
import type { PlaybackState } from "../../playback/model/playback"
import { findActiveSegmentIndex } from "../lib/findActiveSegmentIndex"
import type { LyricDocument } from "../model/lyricDocument"
import { JapaneseText } from "./JapaneseText"
import styles from "./LyricsWorkspace.module.css"

type LyricsWorkspaceTrack = {
  japaneseTitle: string
  englishTitle: string
  artist: string
  artworkSrc: string
  artworkAlt: string
}

type LyricsWorkspaceProps = {
  document: LyricDocument
  track: LyricsWorkspaceTrack
  playback: PlaybackState
  onClose: () => void
  onTogglePlayback: () => void
  onSeek: (time: number) => void
  annotations: Array<{
    explanationId: string
    segmentId: string
    selectedText: string
    selectionKind: "expression" | "kanji"
  }>
  selectedExplanationId: string | null
  onSelectExplanation: (explanationId: string) => void
}

export function LyricsWorkspace({
  document,
  track,
  playback,
  onClose,
  onTogglePlayback,
  onSeek,
  annotations,
  selectedExplanationId,
  onSelectExplanation,
}: LyricsWorkspaceProps) {
  const [translationsVisible, setTranslationsVisible] = useState(true)
  const activeIndex = findActiveSegmentIndex(document, playback.currentTime)
  const activeLine = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const playing = playback.status === "playing"
  const lyricStatus = playing
    ? "Live lyrics"
    : playback.status === "ended"
      ? "Lyrics ended"
      : "Lyrics paused"

  useEffect(() => {
    const previousOverflow = documentElementOverflow()
    window.document.body.style.overflow = "hidden"
    closeButton.current?.focus()
    return () => {
      window.document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    if (selectedExplanationId !== null) return

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    window.document.addEventListener("keydown", closeOnEscape)
    return () => window.document.removeEventListener("keydown", closeOnEscape)
  }, [onClose, selectedExplanationId])

  useEffect(() => {
    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches
    activeLine.current?.scrollIntoView?.({
      block: "center",
      behavior: reducedMotion ? "auto" : "smooth",
    })
  }, [activeIndex])

  return (
    <section
      className={styles.workspace}
      role="dialog"
      aria-modal="true"
      aria-label={`Synchronized lyrics for ${track.japaneseTitle}`}
    >
      <header className={styles.header}>
        <button
          ref={closeButton}
          className={styles.closeButton}
          type="button"
          aria-label="Close lyrics and return to collection"
          onClick={onClose}
        >
          <Icon name="close" size={20} />
        </button>
        <div className={styles.heading}>
          <span>The words behind the music</span>
          <h1 lang="ja">
            {track.japaneseTitle} <small>· {track.artist}</small>
          </h1>
        </div>
        <img src={track.artworkSrc} alt="" />
      </header>

      <main className={styles.main}>
        <aside className={styles.album}>
          <img src={track.artworkSrc} alt={track.artworkAlt} />
          <h2 lang="ja">{track.japaneseTitle}</h2>
          <p>
            {track.englishTitle} · {track.artist}
          </p>
          <span>{playing ? "Stay in the music." : "A moment to take it in."}</span>
        </aside>

        <section className={styles.lyrics} aria-label="Complete synchronized lyrics">
          <div className={styles.toolbar}>
            <div className={styles.liveState} role="status">
              <span className={playing ? styles.liveDot : styles.pausedDot} />
              {lyricStatus}
            </div>
            <button
              className={styles.translationToggle}
              type="button"
              aria-pressed={translationsVisible}
              onClick={() => setTranslationsVisible((visible) => !visible)}
            >
              Translations {translationsVisible ? "on" : "off"}
            </button>
          </div>
          <div className={styles.scroller}>
            {document.segments.map((segment, index) => {
              const state = activeIndex === -1
                ? segment.endSeconds <= playback.currentTime
                  ? styles.past
                  : styles.upcoming
                : index < activeIndex
                  ? styles.past
                  : index === activeIndex
                    ? styles.current
                    : styles.upcoming
              const segmentAnnotations = annotations.filter(
                (annotation) => annotation.segmentId === segment.id,
              )

              return (
                <div
                  ref={index === activeIndex ? activeLine : undefined}
                  className={`${styles.line} ${state}`}
                  key={segment.id}
                  data-segment-id={segment.id}
                  aria-current={index === activeIndex ? "true" : undefined}
                >
                  <time>{formatPlaybackTime(segment.startSeconds)}</time>
                  <div>
                    <p lang="ja">
                      <JapaneseText parts={segment.parts} />
                    </p>
                    {translationsVisible && (
                      <span className={styles.translation}>
                        {segment.translation}
                      </span>
                    )}
                    <div
                      className={styles.annotations}
                      role="group"
                      aria-label={`Learning items for line ${index + 1}`}
                    >
                      {segmentAnnotations.map((annotation) => (
                        <button
                          className={
                            selectedExplanationId === annotation.explanationId
                              ? styles.selectedAnnotation
                              : styles.annotation
                          }
                          type="button"
                          key={annotation.explanationId}
                          data-explanation-id={annotation.explanationId}
                          onClick={() =>
                            onSelectExplanation(annotation.explanationId)
                          }
                        >
                          <span>
                            {annotation.selectionKind === "kanji"
                              ? "Kanji"
                              : "Expression"}
                          </span>
                          <strong lang="ja">{annotation.selectedText}</strong>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
            <p className={styles.credit}>
              Words & music by haruno · Original UtaStream demo
            </p>
          </div>
        </section>
      </main>

      <footer className={styles.transport}>
        <span className={styles.transportTrack}>
          <strong lang="ja">{track.japaneseTitle}</strong>
          <small>{track.artist}</small>
        </span>
        <button
          className={styles.playButton}
          type="button"
          aria-label={playing ? "Pause" : "Play"}
          onClick={onTogglePlayback}
        >
          <Icon name={playing ? "pause" : "play"} size={18} />
        </button>
        <input
          className={styles.timeline}
          type="range"
          min="0"
          max={playback.duration}
          step="1"
          value={Math.floor(playback.currentTime)}
          aria-label="Playback position"
          onChange={(event) => onSeek(Number(event.target.value))}
        />
        <span className={styles.time}>
          {formatPlaybackTime(playback.currentTime)} / {formatPlaybackTime(playback.duration)}
        </span>
      </footer>
    </section>
  )
}

function documentElementOverflow() {
  return window.document.body.style.overflow
}
