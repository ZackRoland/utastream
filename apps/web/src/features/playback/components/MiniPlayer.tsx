import type { CSSProperties } from "react"

import { Icon } from "../../../shared/ui/Icon"
import { formatPlaybackTime } from "../lib/formatPlaybackTime"
import type { PlaybackState } from "../model/playback"
import styles from "./MiniPlayer.module.css"

type MiniPlayerTrack = {
  title: string
  englishTitle: string
  artist: string
  artworkSrc: string
  artworkAlt: string
}

type MiniPlayerProps = {
  track: MiniPlayerTrack
  playback: PlaybackState
  onToggle: () => void
  onSeek: (time: number) => void
}

export function MiniPlayer({
  track,
  playback,
  onToggle,
  onSeek,
}: MiniPlayerProps) {
  const playing = playback.status === "playing"
  const progress = playback.duration
    ? (playback.currentTime / playback.duration) * 100
    : 0

  return (
    <aside className={styles.player} aria-label="Now playing">
      <span className={styles.srOnly} role="status">
        Playback {playback.status}
      </span>
      <div className={styles.track}>
        <img src={track.artworkSrc} alt={track.artworkAlt} />
        <span className={styles.metadata}>
          <strong lang="ja">{track.title}</strong>
          <span>
            {track.artist} · {track.englishTitle}
          </span>
        </span>
      </div>

      <div className={styles.transport}>
        <button
          className={styles.toggle}
          type="button"
          aria-label={playing ? "Pause" : "Play"}
          onClick={onToggle}
        >
          <Icon name={playing ? "pause" : "play"} size={19} />
        </button>
        <label className={styles.timeline}>
          <span className={styles.srOnly}>Playback position</span>
          <input
            type="range"
            min="0"
            max={playback.duration}
            step="1"
            value={Math.floor(playback.currentTime)}
            style={{ "--progress": `${progress}%` } as CSSProperties}
            onChange={(event) => onSeek(Number(event.target.value))}
          />
        </label>
        <span className={styles.time}>
          {formatPlaybackTime(playback.currentTime)} / {formatPlaybackTime(playback.duration)}
        </span>
      </div>

      <span className={styles.fixture}>Permitted fixture audio</span>
    </aside>
  )
}
