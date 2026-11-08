import { useState } from "react"

import {
  SeededCollection,
  seededTracks,
  type TrackId,
} from "../features/catalog"
import { Brand } from "../shared/ui/Brand"
import styles from "./App.module.css"

export function App() {
  const [selectedTrackId, setSelectedTrackId] = useState<TrackId | null>(null)
  const selectedTrack = seededTracks.find((track) => track.id === selectedTrackId)

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Brand />
        <span className={styles.increment}>Catalog migration</span>
      </header>

      <main className={styles.main}>
        <SeededCollection
          tracks={seededTracks}
          selectedTrackId={selectedTrackId}
          onTrackSelect={setSelectedTrackId}
        />

        <p className={styles.selection} aria-live="polite">
          {selectedTrack
            ? `${selectedTrack.englishTitle} is ready for the playback increment.`
            : "Choose a song to establish the catalog-to-playback boundary."}
        </p>
      </main>
    </div>
  )
}
