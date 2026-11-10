import { useEffect, useRef } from "react"

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
}

export function LyricsWorkspace({
  document,
  track,
  playback,
  onClose,
  onTogglePlayback,
  onSeek,
}: LyricsWorkspaceProps) {
  const activeIndex = findActiveSegmentIndex(document, playback.currentTime)
  const activeLine = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const playing = playback.status === "playing"

  useEffect(() => {
    const previousOverflow = documentElementOverflow()
    window.document.body.style.overflow = "hidden"
    closeButton.current?.focus()

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    window.document.addEventListener("keydown", closeOnEscape)
    return () => {
      window.document.body.style.overflow = previousOverflow
      window.document.removeEventListener("keydown", closeOnEscape)
    }
  }, [onClose])

  useEffect(() => {
    activeLine.current?.scrollIntoView?.({ block: "center", behavior: "smooth" })
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
          <div className={styles.liveState} role="status">
            <span className={playing ? styles.liveDot : styles.pausedDot} />
            {playing ? "Live lyrics" : "Lyrics paused"}
          </div>
          <div className={styles.scroller}>
            {document.segments.map((segment, index) => {
              const state =
                index < activeIndex
                  ? styles.past
                  : index === activeIndex
                    ? styles.current
                    : styles.upcoming

              return (
                <div
                  ref={index === activeIndex ? activeLine : undefined}
                  className={`${styles.line} ${state}`}
                  key={segment.id}
                  aria-current={index === activeIndex ? "true" : undefined}
                >
                  <time>{formatPlaybackTime(segment.startSeconds)}</time>
                  <div>
                    <p lang="ja">
                      <JapaneseText parts={segment.parts} />
                    </p>
                    <span>{segment.translation}</span>
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
