import type { Track } from "../model/track"
import styles from "./TrackArtwork.module.css"

type TrackArtworkProps = {
  track: Track
}

export function TrackArtwork({ track }: TrackArtworkProps) {
  return (
    <span className={`${styles.artwork} ${styles[track.artwork.tone]}`}>
      <img src={track.artwork.src} alt={track.artwork.alt} />
      <span className={styles.tint} aria-hidden="true" />
      <span className={styles.label} aria-hidden="true">
        {track.artwork.label}
      </span>
      <span className={styles.japanese} lang="ja" aria-hidden="true">
        {track.japaneseTitle}
      </span>
      <span className={styles.caption} aria-hidden="true">
        {track.artwork.caption}
      </span>
    </span>
  )
}
