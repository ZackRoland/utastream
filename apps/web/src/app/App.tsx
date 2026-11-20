import { useCallback, useEffect, useReducer, useRef, useState } from "react"

import {
  SeededCollection,
  ImportedLibrary,
  LibraryApi,
  seededTracks,
  YouTubeLibraryPlayer,
  type LibraryPlaybackSource,
  type LibraryTrack,
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
import {
  AddTrackFlow,
  ChangeLyricsDialog,
  initialTrackImportState,
  trackImportReducer,
} from "../features/track-import"
import { Brand } from "../shared/ui/Brand"
import styles from "./App.module.css"

const libraryApi = new LibraryApi()
const DEVELOPMENT_USER_ID = "00000000-0000-0000-0000-000000000001"

export function App() {
  const [importedTracks, setImportedTracks] = useState<LibraryTrack[]>([])
  const [activeImportedPlayback, setActiveImportedPlayback] = useState<{
    track: LibraryTrack
    source: LibraryPlaybackSource & { externalId: string }
  } | null>(null)
  const [lyricsOpen, setLyricsOpen] = useState(false)
  const [lyricReview, setLyricReview] = useState<{
    track: LibraryTrack
    source: LibraryPlaybackSource
  } | null>(null)
  const [selectedExplanationId, setSelectedExplanationId] = useState<
    string | null
  >(null)
  const [learningCollection, dispatchLearningCollection] = useReducer(
    learningCollectionReducer,
    initialLearningCollectionState,
  )
  const [trackImport, dispatchTrackImport] = useReducer(
    trackImportReducer,
    initialTrackImportState,
  )
  const lyricsTrigger = useRef<HTMLButtonElement>(null)
  const addTrackTrigger = useRef<HTMLButtonElement>(null)
  const playback = useAudioPlayback()
  const importOpen = trackImport.step !== "closed"
  const lyricReviewOpen = lyricReview !== null
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
  const closeTrackImport = useCallback(() => {
    dispatchTrackImport({ type: "close" })
    requestAnimationFrame(() => addTrackTrigger.current?.focus())
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void libraryApi
      .getLibrary(DEVELOPMENT_USER_ID, { signal: controller.signal })
      .then((library) => setImportedTracks(library.items))
      .catch(() => undefined)
    return () => controller.abort()
  }, [])

  const acceptImportedTrack = useCallback((item: LibraryTrack) => {
    setImportedTracks((current) => [
      ...current.filter((candidate) => candidate.trackId !== item.trackId),
      item,
    ])
    setActiveImportedPlayback((current) =>
      current?.track.trackId === item.trackId
        ? { ...current, track: item }
        : current,
    )
    setLyricReview((current) =>
      current?.track.trackId === item.trackId
        ? { ...current, track: item }
        : current,
    )
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

    setActiveImportedPlayback(null)

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
      <div
        inert={lyricsOpen || importOpen || lyricReviewOpen || undefined}
        aria-hidden={lyricsOpen || importOpen || lyricReviewOpen || undefined}
      >
        <header className={styles.header}>
          <Brand />
          <div className={styles.headerActions}>
            <span className={styles.increment}>Client skeleton acceptance</span>
            <button
              ref={addTrackTrigger}
              className={styles.addTrack}
              type="button"
              onClick={() => dispatchTrackImport({ type: "open" })}
            >
              Add track
            </button>
          </div>
        </header>

        <main className={styles.main}>
          <SeededCollection
            tracks={seededTracks}
            selectedTrackId={playback.state.trackId}
            onTrackSelect={selectTrack}
          />
          <ImportedLibrary
            items={importedTracks}
            activeTrackId={activeImportedPlayback?.track.trackId}
            onPlay={(track, source) => {
              playback.pause()
              setActiveImportedPlayback({ track, source })
            }}
            onReviewLyrics={(track, source) =>
              setLyricReview({ track, source })
            }
          />

          {activeImportedPlayback && (
            <YouTubeLibraryPlayer
              track={activeImportedPlayback.track}
              source={activeImportedPlayback.source}
              onClose={() => setActiveImportedPlayback(null)}
              onLyricsVisibilityChange={setLyricsOpen}
            />
          )}

          <p className={styles.selection} aria-live="polite">
            {activeImportedPlayback
              ? `${activeImportedPlayback.track.title} is open in the official YouTube player.`
              : selectedTrack
                ? `${selectedTrack.englishTitle} is loaded in the browser audio player.`
                : "Choose a track to start playback."}
          </p>

          {playback.state.status === "error" && !activeImportedPlayback && (
            <p className={styles.selection} role="alert">
              The fixture audio could not be played. Choose the track to retry.
            </p>
          )}

          {!activeImportedPlayback &&
            selectedTrack?.id === beyondTheNightLyrics.trackId && (
            <LyricsPreview
              document={beyondTheNightLyrics}
              currentTimeSeconds={playback.state.currentTime}
              onOpen={openLyrics}
              openButtonRef={lyricsTrigger}
            />
          )}

          {!activeImportedPlayback &&
            selectedTrack?.lyricStatus === "unavailable" && (
            <section className={styles.lyricsUnavailable} role="status">
              <span>Playback remains available</span>
              <h2>Lyrics aren’t available for this fixture.</h2>
              <p>
                Choose the lyric-ready track to continue the learning walkthrough.
              </p>
            </section>
          )}
        </main>

        {selectedTrack && !lyricsOpen && !activeImportedPlayback && (
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

      {!activeImportedPlayback &&
        selectedTrack?.id === beyondTheNightLyrics.trackId &&
        lyricsOpen && (
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

      <AddTrackFlow
        state={trackImport}
        dispatch={dispatchTrackImport}
        onClose={closeTrackImport}
        onImported={acceptImportedTrack}
      />

      {lyricReview && (
        <ChangeLyricsDialog
          track={lyricReview.track}
          source={lyricReview.source}
          onClose={() => setLyricReview(null)}
          onChanged={acceptImportedTrack}
        />
      )}

      <audio ref={playback.mediaRef} preload="metadata" hidden />
    </div>
  )
}
