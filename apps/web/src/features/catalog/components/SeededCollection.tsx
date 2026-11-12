import type { Track, TrackId } from "../model/track"
import { TrackCard } from "./TrackCard"
import styles from "./SeededCollection.module.css"

type SeededCollectionProps = {
  tracks: readonly Track[]
  selectedTrackId: TrackId | null
  onTrackSelect: (trackId: TrackId) => void
}

export function SeededCollection({
  tracks,
  selectedTrackId,
  onTrackSelect,
}: SeededCollectionProps) {
  return (
    <section aria-labelledby="collection-title">
      <header className={styles.heading}>
        <span className={styles.eyebrow}>BACK IN YOUR ROTATION</span>
        <h1 id="collection-title">Some songs feel like coming home.</h1>
        <p>Choose the permitted audio fixture for the first listening journey.</p>
      </header>
      <div className={styles.grid}>
        {tracks.map((track) => (
          <TrackCard
            key={track.id}
            track={track}
            selected={track.id === selectedTrackId}
            onSelect={onTrackSelect}
          />
        ))}
      </div>
    </section>
  )
}
