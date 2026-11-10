import { useCallback, useReducer, useRef, useState } from "react"

import {
  SeededCollection,
  seededTracks,
  type TrackId,
} from "../features/catalog"
import {
  beyondTheNightLyrics,
  LyricsPreview,
  LyricsWorkspace,
} from "../features/lyrics"
import {
  beyondTheNightExplanations,
  ExpressionExplanationPanel,
  initialLearningCollectionState,
  isExpressionSaved,
  learningCollectionReducer,
} from "../features/learning"
import { MiniPlayer, useFixturePlayback } from "../features/playback"
import { Brand } from "../shared/ui/Brand"
import styles from "./App.module.css"

export function App() {
  const [lyricsOpen, setLyricsOpen] = useState(false)
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null)
  const [learningCollection, dispatchLearningCollection] = useReducer(
    learningCollectionReducer,
    initialLearningCollectionState,
  )
  const lyricsTrigger = useRef<HTMLButtonElement>(null)
  const playback = useFixturePlayback()
  const selectedTrack = seededTracks.find(
    (track) => track.id === playback.state.trackId,
  )
  const openLyrics = useCallback(() => setLyricsOpen(true), [])
  const closeLyrics = useCallback(() => {
    setSelectedSegmentId(null)
    setLyricsOpen(false)
    requestAnimationFrame(() => lyricsTrigger.current?.focus())
  }, [])
  const closeExplanation = useCallback(() => {
    setSelectedSegmentId((segmentId) => {
      requestAnimationFrame(() => {
        if (segmentId) {
          window.document
            .querySelector<HTMLButtonElement>(`[data-segment-id="${segmentId}"]`)
            ?.focus()
        }
      })
      return null
    })
  }, [])
  const selectedSegment = beyondTheNightLyrics.segments.find(
    (segment) => segment.id === selectedSegmentId,
  )
  const selectedExplanation = beyondTheNightExplanations.find(
    (explanation) => explanation.segmentId === selectedSegmentId,
  )
  const selectedExpressionSaved = selectedExplanation
    ? isExpressionSaved(learningCollection, selectedExplanation.id)
    : false

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
      <div inert={lyricsOpen || undefined} aria-hidden={lyricsOpen || undefined}>
        <header className={styles.header}>
          <Brand />
          <span className={styles.increment}>Save learning item</span>
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
              onOpen={openLyrics}
              openButtonRef={lyricsTrigger}
            />
          )}
        </main>

        {selectedTrack && !lyricsOpen && (
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

      {selectedTrack?.id === beyondTheNightLyrics.trackId && lyricsOpen && (
        <div
          inert={selectedExplanation ? true : undefined}
          aria-hidden={selectedExplanation ? true : undefined}
        >
          <LyricsWorkspace
            document={beyondTheNightLyrics}
            track={{
              japaneseTitle: selectedTrack.japaneseTitle,
              englishTitle: selectedTrack.englishTitle,
              artist: selectedTrack.artist,
              artworkSrc: selectedTrack.artwork.src,
              artworkAlt: selectedTrack.artwork.alt,
            }}
            playback={playback.state}
            onClose={closeLyrics}
            onTogglePlayback={playback.toggle}
            onSeek={playback.seek}
            selectedSegmentId={selectedSegmentId}
            onSelectSegment={setSelectedSegmentId}
          />
        </div>
      )}

      {selectedSegment && selectedExplanation && (
        <ExpressionExplanationPanel
          explanation={selectedExplanation}
          sentence={selectedSegment.parts.map((part) => part.text).join("")}
          translation={selectedSegment.translation}
          saved={selectedExpressionSaved}
          onSave={() =>
            dispatchLearningCollection({
              type: "save",
              item: {
                id: `${beyondTheNightLyrics.trackId}:${selectedSegment.id}`,
                trackId: beyondTheNightLyrics.trackId,
                segmentId: selectedSegment.id,
                explanationId: selectedExplanation.id,
              },
            })
          }
          onClose={closeExplanation}
        />
      )}
    </div>
  )
}
