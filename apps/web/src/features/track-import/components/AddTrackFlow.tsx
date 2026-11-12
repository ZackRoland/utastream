import { useEffect, useRef } from "react"

import { LocalFileSourceStep } from "../adapters/local-file/LocalFileSourceStep"
import { YouTubeSourceStep } from "../adapters/youtube/YouTubeSourceStep"
import type {
  ImportSourceKind,
  PlaybackSourceProbe,
  TrackImportAction,
  TrackImportState,
} from "../model/trackImport"
import styles from "./AddTrackFlow.module.css"

type AddTrackFlowProps = {
  state: TrackImportState
  dispatch: (action: TrackImportAction) => void
  onClose: () => void
}

const sourceGuidance = {
  local_file: {
    eyebrow: "Audio from this device",
    title: "Use a file you’re allowed to play",
    summary:
      "Playback stays in this browser. UtaStream does not upload the audio in this path.",
    points: [
      "Best when you already have an audio file on this device.",
      "You may need to select the file again after closing the browser.",
      "Track identity, lyrics, and saved learning remain usable if the file is missing.",
    ],
  },
  youtube: {
    eyebrow: "YouTube link",
    title: "Use the official visible player",
    summary:
      "UtaStream stores a validated video reference—not iframe markup or copied media.",
    points: [
      "Best when a reusable public or unlisted YouTube video is convenient.",
      "YouTube controls and branding remain visible during playback.",
      "A removed, private, restricted, or non-embeddable video may need replacement.",
    ],
  },
} satisfies Record<
  ImportSourceKind,
  {
    eyebrow: string
    title: string
    summary: string
    points: string[]
  }
>

export function AddTrackFlow({ state, dispatch, onClose }: AddTrackFlowProps) {
  const closeButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeButton.current?.focus()
  }, [state.step])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [onClose])

  if (state.step === "closed") return null

  const guidance = state.sourceKind
    ? sourceGuidance[state.sourceKind]
    : null

  return (
    <section
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-track-title"
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <span>ADD TO YOUR LIBRARY</span>
          <button
            ref={closeButton}
            className={styles.close}
            type="button"
            aria-label="Close add track"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        {state.step === "choose_source" && (
          <ChooseSource
            onSelect={(sourceKind) =>
              dispatch({ type: "select_source", sourceKind })
            }
          />
        )}

        {state.step === "review_guidance" && guidance && (
          <Guidance
            guidance={guidance}
            sourceKind={state.sourceKind as ImportSourceKind}
            onBack={() => dispatch({ type: "back" })}
            onContinue={() => dispatch({ type: "continue" })}
          />
        )}

        {state.step === "awaiting_source" &&
          state.sourceKind === "youtube" && (
            <div className={styles.content}>
              <YouTubeSourceStep
                onBack={() => dispatch({ type: "back" })}
                onSourceReady={(sourceProbe) =>
                  dispatch({ type: "source_ready", sourceProbe })
                }
              />
            </div>
          )}

        {state.step === "awaiting_source" &&
          state.sourceKind === "local_file" && (
          <div className={styles.content}>
            <LocalFileSourceStep
              onBack={() => dispatch({ type: "back" })}
              onSourceReady={(sourceProbe) =>
                dispatch({ type: "source_ready", sourceProbe })
              }
            />
          </div>
          )}

        {state.step === "confirm_source" && state.sourceProbe && (
          <SourceConfirmation
            sourceProbe={state.sourceProbe}
            onConfirm={() => dispatch({ type: "confirm_source" })}
            onReplace={() => dispatch({ type: "replace_source" })}
          />
        )}

        {state.step === "source_confirmed" && state.sourceProbe && (
          <SourceConfirmed
            sourceProbe={state.sourceProbe}
            onReplace={() => dispatch({ type: "replace_source" })}
          />
        )}
      </div>
    </section>
  )
}

function ChooseSource({
  onSelect,
}: {
  onSelect: (sourceKind: ImportSourceKind) => void
}) {
  return (
    <div className={styles.content}>
      <span className={styles.step}>STEP 1 OF 5 · CHOOSE A SOURCE</span>
      <h2 id="add-track-title">How would you like to listen?</h2>
      <p className={styles.intro}>
        Both choices lead to one source-neutral library track, the same lyric
        confirmation, and the same saved-learning history.
      </p>

      <div className={styles.choices}>
        <button type="button" onClick={() => onSelect("local_file")}>
          <span>FROM THIS DEVICE</span>
          <strong>Choose an audio file</strong>
          <small>Device-local browser playback · no audio upload</small>
        </button>
        <button type="button" onClick={() => onSelect("youtube")}>
          <span>FROM YOUTUBE</span>
          <strong>Paste a video link</strong>
          <small>Convenient across devices · provider availability applies</small>
        </button>
      </div>

      <aside className={styles.howTo} aria-labelledby="how-to-choose">
        <h3 id="how-to-choose">How to choose</h3>
        <p>
          Prefer a local file when you control the media and are listening on
          this device. Prefer YouTube when link-based access across devices is
          more useful. Lyrics are queried and confirmed separately either way.
        </p>
      </aside>
    </div>
  )
}

function Guidance({
  guidance,
  sourceKind,
  onBack,
  onContinue,
}: {
  guidance: (typeof sourceGuidance)[ImportSourceKind]
  sourceKind: ImportSourceKind
  onBack: () => void
  onContinue: () => void
}) {
  return (
    <div className={styles.content}>
      <span className={styles.step}>STEP 2 OF 5 · REVIEW GUIDANCE</span>
      <span className={styles.eyebrow}>{guidance.eyebrow}</span>
      <h2 id="add-track-title">{guidance.title}</h2>
      <p className={styles.intro}>{guidance.summary}</p>
      <ul className={styles.points}>
        {guidance.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <p className={styles.notice}>
        {sourceKind === "local_file"
          ? "Selecting a file does not grant UtaStream permission to upload or distribute it."
          : "Submitting a link does not transfer media or lyric rights to UtaStream."}
      </p>
      <footer className={styles.actions}>
        <button type="button" onClick={onBack}>
          Back
        </button>
        <button className={styles.primary} type="button" onClick={onContinue}>
          I understand, continue
        </button>
      </footer>
    </div>
  )
}

function SourceConfirmation({
  sourceProbe,
  onConfirm,
  onReplace,
}: {
  sourceProbe: PlaybackSourceProbe
  onConfirm: () => void
  onReplace: () => void
}) {
  return (
    <div className={styles.content}>
      <span className={styles.step}>STEP 4 OF 5 · CONFIRM SOURCE</span>
      <h2 id="add-track-title">
        {sourceProbe.kind === "youtube"
          ? "Use this YouTube video?"
          : "Use this local audio file?"}
      </h2>
      <p className={styles.intro}>
        Confirm the playback reference before UtaStream searches for the
        canonical recording and lyrics.
      </p>
      <dl className={styles.sourceFacts}>
        <div>
          <dt>Provider reference</dt>
          <dd>
            {sourceProbe.externalId ??
              String(sourceProbe.originalMetadata.filename ?? "Local file")}
          </dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>
            {sourceProbe.durationSeconds === null
              ? "Unavailable"
              : `${Math.round(sourceProbe.durationSeconds)} seconds`}
          </dd>
        </div>
        <div>
          <dt>Playback</dt>
          <dd>
            {sourceProbe.kind === "youtube"
              ? "Official visible YouTube player"
              : "Temporary device-local browser audio"}
          </dd>
        </div>
      </dl>
      <p className={styles.notice}>
        {sourceProbe.kind === "youtube"
          ? "UtaStream will retain the validated video ID and normalized URL. It will not retain iframe HTML or copy the media."
          : "UtaStream will retain corrected matching metadata, not the File or temporary object URL. Browser access is released when this preview closes, so the file will be required again for playback."}
      </p>
      <footer className={styles.actions}>
        <button type="button" onClick={onReplace}>
          Replace source
        </button>
        <button className={styles.primary} type="button" onClick={onConfirm}>
          Use this source
        </button>
      </footer>
    </div>
  )
}

function SourceConfirmed({
  sourceProbe,
  onReplace,
}: {
  sourceProbe: PlaybackSourceProbe
  onReplace: () => void
}) {
  return (
    <div className={styles.content}>
      <span className={styles.step}>STEP 5 OF 5 · SOURCE READY</span>
      <h2 id="add-track-title">Ready for recording and lyric matching</h2>
      <p className={styles.intro}>
        {sourceProbe.kind === "youtube"
          ? `Video ${sourceProbe.externalId} is represented as a replaceable playback source.`
          : "The local file is represented by corrected metadata only; its bytes and temporary playback URL were not retained."} {" "}
        The source-neutral library track has not been created or changed yet.
      </p>
      <div className={styles.adapterBoundary} role="status">
        <span>
          {sourceProbe.kind === "youtube"
            ? "YouTube source ready"
            : "Local-file metadata ready"}
        </span>
        <strong>Lyric query and confirmation comes next</strong>
        <p>
          {sourceProbe.kind === "youtube"
            ? "If this source later becomes private, deleted, restricted, or non-embeddable, it can be replaced without changing library identity."
            : "This source is marked local file required outside the active preview. Reselecting or replacing it will not define library identity."}
        </p>
      </div>
      <footer className={styles.actions}>
        <button type="button" onClick={onReplace}>
          Replace source
        </button>
      </footer>
    </div>
  )
}
