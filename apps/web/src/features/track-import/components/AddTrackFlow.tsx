import { useEffect, useRef } from "react"

import type {
  ImportSourceKind,
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
    handoffTitle: "Local-file selection isn’t connected yet",
    handoffBody:
      "This review build stops before file selection. The next implementation adds duration probing, playback, reselection, and cleanup without transmitting the audio bytes.",
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
    handoffTitle: "YouTube connection isn’t connected yet",
    handoffBody:
      "This review build stops before link entry. A later implementation adds URL validation, the official IFrame player, permitted metadata, capability states, and source replacement.",
  },
} satisfies Record<
  ImportSourceKind,
  {
    eyebrow: string
    title: string
    summary: string
    points: string[]
    handoffTitle: string
    handoffBody: string
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

        {state.step === "awaiting_source" && guidance && (
          <AdapterHandoff
            guidance={guidance}
            onBack={() => dispatch({ type: "back" })}
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
      <span className={styles.step}>STEP 1 OF 3 · CHOOSE A SOURCE</span>
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
      <span className={styles.step}>STEP 2 OF 3 · REVIEW GUIDANCE</span>
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

function AdapterHandoff({
  guidance,
  onBack,
}: {
  guidance: (typeof sourceGuidance)[ImportSourceKind]
  onBack: () => void
}) {
  return (
    <div className={styles.content}>
      <span className={styles.step}>STEP 3 OF 3 · CONNECT SOURCE</span>
      <h2 id="add-track-title">{guidance.handoffTitle}</h2>
      <p className={styles.intro}>{guidance.handoffBody}</p>
      <div className={styles.adapterBoundary} role="status">
        <span>Shared flow ready</span>
        <strong>Provider adapter not connected in this increment</strong>
        <p>
          The confirmation, lyric matching, and library steps will resume here
          after the selected adapter returns source metadata.
        </p>
      </div>
      <footer className={styles.actions}>
        <button type="button" onClick={onBack}>
          Review guidance
        </button>
      </footer>
    </div>
  )
}
