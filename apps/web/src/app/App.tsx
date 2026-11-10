import {
  SeededCollection,
  seededTracks,
  type TrackId,
} from "../features/catalog"
import { beyondTheNightLyrics, LyricsPreview } from "../features/lyrics"
import { MiniPlayer, useFixturePlayback } from "../features/playback"
import { Brand } from "../shared/ui/Brand"
import styles from "./App.module.css"

export function App() {
  const playback = useFixturePlayback()
  const selectedTrack = seededTracks.find(
    (track) => track.id === playback.state.trackId,
  )

  function selectTrack(trackId: TrackId) {
    const track = seededTracks.find((candidate) => candidate.id === trackId)
    if (!track) return

    playback.load(
      { trackId: track.id, durationSeconds: track.durationSeconds },
      { autoPlay: true },
    )
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Brand />
        <span className={styles.increment}>Synchronized lyric preview</span>
      </header>

      <main className={styles.main}>
        <SeededCollection
          tracks={seededTracks}
          selectedTrackId={playback.state.trackId}
          onTrackSelect={selectTrack}
        />

        <p className={styles.selection} aria-live="polite">
          {selectedTrack
            ? `${selectedTrack.englishTitle} is loaded in the fixture player.`
            : "Choose a song to establish the catalog-to-playback boundary."}
        </p>

        {selectedTrack?.id === beyondTheNightLyrics.trackId && (
          <LyricsPreview
            document={beyondTheNightLyrics}
            currentTimeSeconds={playback.state.currentTime}
          />
        )}
      </main>

      {selectedTrack && (
        <MiniPlayer
          track={{
            title: selectedTrack.japaneseTitle,
            englishTitle: selectedTrack.englishTitle,
            artist: selectedTrack.artist,
            artworkSrc: selectedTrack.artwork.src,
            artworkAlt: selectedTrack.artwork.alt,
          }}
          playback={playback.state}
          onToggle={playback.toggle}
          onSeek={playback.seek}
        />
      )}
    </div>
  )
}
