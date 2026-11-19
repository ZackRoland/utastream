import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { LyricsPreview, LyricsWorkspace } from "../../lyrics"
import type { PlaybackState } from "../../playback/model/playback"
import {
  mountYouTubePlayer,
  type YouTubePlaybackState,
  type YouTubePlayerCallbacks,
  type YouTubePlayerHandle,
} from "../../track-import/adapters/youtube/youtubePlayer"
import type { LibraryTrack } from "../api/libraryApi"
import { toLyricDocument } from "../lib/libraryLyrics"
import {
  type LibraryPlaybackSource,
  youtubeThumbnailUrl,
} from "../lib/libraryPlayback"
import styles from "./YouTubeLibraryPlayer.module.css"

type MountPlayer = (
  element: HTMLElement,
  videoId: string,
  callbacks: YouTubePlayerCallbacks,
) => Promise<YouTubePlayerHandle>

type Props = {
  track: LibraryTrack
  source: LibraryPlaybackSource & { externalId: string }
  onClose: () => void
  onLyricsVisibilityChange?: (visible: boolean) => void
  mountPlayer?: MountPlayer
}

export function YouTubeLibraryPlayer({
  track,
  source,
  onClose,
  onLyricsVisibilityChange,
  mountPlayer = mountYouTubePlayer,
}: Props) {
  const host = useRef<HTMLDivElement>(null)
  const handle = useRef<YouTubePlayerHandle | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [lyricsOpen, setLyricsOpen] = useState(false)
  const [playback, setPlayback] = useState<PlaybackState>(() => ({
    trackId: track.trackId,
    status: "loading",
    currentTime: 0,
    duration: source.durationSeconds ?? track.durationSeconds,
  }))
  const lyricDocument = useMemo(() => toLyricDocument(track), [track])

  useEffect(() => {
    if (!host.current) return
    let active = true
    let timer: number | null = null
    setErrorMessage("")
    setPlayback({
      trackId: track.trackId,
      status: "loading",
      currentTime: 0,
      duration: source.durationSeconds ?? track.durationSeconds,
    })

    void mountPlayer(host.current, source.externalId, {
      onReady: (duration) => {
        if (!active) return
        setPlayback((current) => ({
          ...current,
          status: "paused",
          duration: duration ?? current.duration,
        }))
      },
      onStateChange: (state) => {
        if (active) applyPlayerState(state, setPlayback)
      },
      onError: (error) => {
        if (!active) return
        setErrorMessage(error.message)
        setPlayback((current) => ({ ...current, status: "error" }))
      },
    })
      .then((mounted) => {
        if (!active) {
          mounted.destroy()
          return
        }
        handle.current = mounted
        timer = window.setInterval(() => {
          const currentTime = mounted.getCurrentTime()
          const duration = mounted.getDuration()
          if (!Number.isFinite(currentTime)) return
          setPlayback((current) => ({
            ...current,
            currentTime,
            duration:
              Number.isFinite(duration) && duration > 0
                ? duration
                : current.duration,
          }))
        }, 250)
      })
      .catch(() => {
        if (!active) return
        setErrorMessage(
          "The YouTube player could not be loaded. Check your connection and retry.",
        )
        setPlayback((current) => ({ ...current, status: "error" }))
      })

    return () => {
      active = false
      if (timer !== null) window.clearInterval(timer)
      handle.current?.destroy()
      handle.current = null
    }
  }, [
    mountPlayer,
    source.durationSeconds,
    source.externalId,
    track.durationSeconds,
    track.trackId,
  ])

  useEffect(
    () => () => onLyricsVisibilityChange?.(false),
    [onLyricsVisibilityChange],
  )

  function togglePlayback() {
    if (playback.status === "playing") handle.current?.pause()
    else handle.current?.play()
  }

  function seek(time: number) {
    handle.current?.seek(time)
    setPlayback((current) => ({ ...current, currentTime: time }))
  }

  function setLyricsVisibility(visible: boolean) {
    setLyricsOpen(visible)
    onLyricsVisibilityChange?.(visible)
  }

  const artworkSrc = youtubeThumbnailUrl(source.externalId)

  return (
    <>
      <section
        className={styles.shell}
        aria-label={`YouTube player for ${track.title}`}
      >
        <header className={styles.header}>
          <div>
            <span>NOW PLAYING FROM YOUR LIBRARY</span>
            <h2>{track.title}</h2>
            <p>{track.artist}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setLyricsVisibility(false)
              onClose()
            }}
          >
            Close player
          </button>
        </header>
        <div className={styles.player} ref={host} />
        {playback.status === "loading" && (
          <p className={styles.status}>Preparing the official YouTube player…</p>
        )}
        {playback.status !== "loading" && playback.status !== "error" && (
          <p className={styles.status} role="status">
            Use the visible YouTube controls or open synchronized lyrics below.
          </p>
        )}
        {playback.status === "error" && (
          <p className={styles.failure} role="alert">{errorMessage}</p>
        )}
        {lyricDocument && playback.status !== "error" && (
          <LyricsPreview
            document={lyricDocument}
            currentTimeSeconds={playback.currentTime}
            onOpen={() => setLyricsVisibility(true)}
          />
        )}
      </section>

      {lyricsOpen &&
        lyricDocument &&
        createPortal(
          <LyricsWorkspace
            document={lyricDocument}
            track={{
              japaneseTitle: track.title,
              englishTitle: track.album ?? "YouTube",
              artist: track.artist,
              artworkSrc,
              artworkAlt: `${track.title} YouTube thumbnail`,
            }}
            playback={playback}
            onClose={() => setLyricsVisibility(false)}
            onTogglePlayback={togglePlayback}
            onSeek={seek}
            annotations={[]}
            selectedExplanationId={null}
            onSelectExplanation={() => undefined}
            credit={track.lyrics?.attribution ?? "Lyrics supplied by LRCLIB"}
          />,
          window.document.body,
        )}
    </>
  )
}

function applyPlayerState(
  state: YouTubePlaybackState,
  setPlayback: React.Dispatch<React.SetStateAction<PlaybackState>>,
) {
  setPlayback((current) => {
    switch (state) {
      case "playing":
        return { ...current, status: "playing" }
      case "paused":
      case "cued":
        return { ...current, status: "paused" }
      case "ended":
        return {
          ...current,
          status: "ended",
          currentTime: current.duration,
        }
      case "buffering":
        return { ...current, status: "loading" }
      case "unstarted":
        return current
    }
  })
}
