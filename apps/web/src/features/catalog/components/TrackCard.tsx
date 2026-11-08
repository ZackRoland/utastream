import { Icon } from "../../../shared/ui/Icon"
import type { Track, TrackId } from "../model/track"
import { TrackArtwork } from "./TrackArtwork"
import styles from "./TrackCard.module.css"

type TrackCardProps = {
  track: Track
  selected: boolean
  onSelect: (trackId: TrackId) => void
}

export function TrackCard({ track, selected, onSelect }: TrackCardProps) {
  return (
    <button
      className={styles.card}
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(track.id)}
    >
      <span className={styles.artworkWrap}>
        <TrackArtwork track={track} />
        <span className={styles.play} aria-hidden="true">
          <Icon name="play" size={20} />
        </span>
      </span>
      <strong className={styles.title} lang="ja">
        {track.japaneseTitle}
      </strong>
      <span className={styles.details}>
        {track.artist} <span aria-hidden="true">·</span> {track.genre}
      </span>
      {track.lyricStatus === "ready" && (
        <span className={styles.status}>Lyrics ready</span>
      )}
    </button>
  )
}
