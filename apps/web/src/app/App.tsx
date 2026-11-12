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
  createSavedLearningItemId,
  ExpressionExplanationPanel,
  initialLearningCollectionState,
  isLearningItemSaved,
  learningCollectionReducer,
} from "../features/learning"
import { MiniPlayer, useAudioPlayback } from "../features/playback"
import { Brand } from "../shared/ui/Brand"
import styles from "./App.module.css"

export function App() {
  const [lyricsOpen, setLyricsOpen] = useState(false)
  const [selectedExplanationId, setSelectedExplanationId] = useState<
    string | null
  >(null)
  const [learningCollection, dispatchLearningCollection] = useReducer(
    learningCollectionReducer,
    initialLearningCollectionState,
  )
  const lyricsTrigger = useRef<HTMLButtonElement>(null)
  const playback = useAudioPlayback()
  const selectedTrack = seededTracks.find(
    (track) => track.id === playback.state.trackId,
  )
  const openLyrics = useCallback(() => setLyricsOpen(true), [])
  const closeLyrics = useCallback(() => {
    setSelectedExplanationId(null)
    setLyricsOpen(false)
    requestAnimationFrame(() => lyricsTrigger.current?.focus())
  }, [])
  const closeExplanation = useCallback(() => {
    setSelectedExplanationId((explanationId) => {
      requestAnimationFrame(() => {
        if (explanationId) {
          window.document
            .querySelector<HTMLButtonElement>(
              `[data-explanation-id="${explanationId}"]`,
            )
            ?.focus()
        }
      })
      return null
    })
  }, [])
  const selectedExplanation = beyondTheNightExplanations.find(
    (explanation) => explanation.id === selectedExplanationId,
  )
  const selectedSegment = beyondTheNightLyrics.segments.find(
    (segment) => segment.id === selectedExplanation?.segmentId,
  )
  const selectedItemId = selectedExplanation
    ? createSavedLearningItemId({
        testUserId: "fixture-user",
        lyricDocumentId: beyondTheNightLyrics.id,
        lyricDocumentVersion: beyondTheNightLyrics.version,
        explanationId: selectedExplanation.id,
      })
    : null
  const selectedItemSaved = selectedItemId
    ? isLearningItemSaved(learningCollection, selectedItemId)
    : false

  function saveSelectedItem() {
    if (!selectedExplanation || !selectedSegment || !selectedItemId) return

    dispatchLearningCollection({
      type: "save",
      item: {
        id: selectedItemId,
        testUserId: "fixture-user",
        trackId: beyondTheNightLyrics.trackId,
        lyricDocumentId: beyondTheNightLyrics.id,
        lyricDocumentVersion: beyondTheNightLyrics.version,
        segmentId: selectedSegment.id,
        explanationId: selectedExplanation.id,
        selectedText: selectedExplanation.selectedText,
        selectionKind: selectedExplanation.selectionKind,
        savedAt: new Date().toISOString(),
      },
    })
  }

  function selectTrack(trackId: TrackId) {
    const track = seededTracks.find((candidate) => candidate.id === trackId)
    if (!track) return

    if (!track.mediaAsset) return

    playback.load(
      {
        trackId: track.id,
        src: track.mediaAsset.src,
        expectedDurationSeconds: track.mediaAsset.expectedDurationSeconds,
      },
      { autoPlay: true },
    )
  }

  return (
    <div className={styles.shell}>
      <div inert={lyricsOpen || undefined} aria-hidden={lyricsOpen || undefined}>
        <header className={styles.header}>
          <Brand />
          <span className={styles.increment}>Client skeleton acceptance</span>
        </header>

        <main className={styles.main}>
          <SeededCollection
            tracks={seededTracks}
            selectedTrackId={playback.state.trackId}
            onTrackSelect={selectTrack}
          />

          <p className={styles.selection} aria-live="polite">
            {selectedTrack
              ? `${selectedTrack.englishTitle} is loaded in the browser audio player.`
              : "Choose the permitted audio fixture to start real playback."}
          </p>

          {playback.state.status === "error" && (
            <p className={styles.selection} role="alert">
              The fixture audio could not be played. Choose the track to retry.
            </p>
          )}

          {selectedTrack?.id === beyondTheNightLyrics.trackId && (
            <LyricsPreview
              document={beyondTheNightLyrics}
              currentTimeSeconds={playback.state.currentTime}
              onOpen={openLyrics}
              openButtonRef={lyricsTrigger}
            />
          )}

          {selectedTrack?.lyricStatus === "unavailable" && (
            <section className={styles.lyricsUnavailable} role="status">
              <span>Playback remains available</span>
              <h2>Lyrics aren’t available for this fixture.</h2>
              <p>
                Choose the lyric-ready track to continue the learning walkthrough.
              </p>
            </section>
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
            annotations={beyondTheNightExplanations.map((explanation) => ({
              explanationId: explanation.id,
              segmentId: explanation.segmentId,
              selectedText: explanation.selectedText,
              selectionKind: explanation.selectionKind,
            }))}
            selectedExplanationId={selectedExplanationId}
            onSelectExplanation={setSelectedExplanationId}
          />
        </div>
      )}

      {selectedSegment && selectedExplanation && (
        <ExpressionExplanationPanel
          explanation={selectedExplanation}
          sentence={selectedSegment.parts.map((part) => part.text).join("")}
          translation={selectedSegment.translation}
          saved={selectedItemSaved}
          onSave={saveSelectedItem}
          onClose={closeExplanation}
        />
      )}

      <audio ref={playback.mediaRef} preload="metadata" hidden />
    </div>
  )
}
