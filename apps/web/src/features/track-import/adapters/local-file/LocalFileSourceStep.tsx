import { useEffect, useState } from "react"
import type { ChangeEvent } from "react"

import type { PlaybackSourceProbe } from "../../model/trackImport"
import { inferTitleFromFilename, isPossibleAudioFile } from "./localFileMetadata"
import styles from "./LocalFileSourceStep.module.css"

type ObjectUrlApi = Pick<typeof URL, "createObjectURL" | "revokeObjectURL">

type LocalFileSourceStepProps = {
  onBack: () => void
  onSourceReady: (sourceProbe: PlaybackSourceProbe) => void
  objectUrlApi?: ObjectUrlApi
}

export function LocalFileSourceStep({
  onBack,
  onSourceReady,
  objectUrlApi = URL,
}: LocalFileSourceStepProps) {
  const [file, setFile] = useState<File | null>(null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null)
  const [title, setTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [error, setError] = useState<string | null>(null)
  useEffect(
    () => () => {
      if (objectUrl) objectUrlApi.revokeObjectURL(objectUrl)
    },
    [objectUrl, objectUrlApi],
  )

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null
    if (!selected) return

    if (!isPossibleAudioFile(selected)) {
      setError("Choose a non-empty audio file supported by your browser.")
      event.target.value = ""
      return
    }

    const nextObjectUrl = objectUrlApi.createObjectURL(selected)
    setFile(selected)
    setObjectUrl(nextObjectUrl)
    setDurationSeconds(null)
    setTitle(inferTitleFromFilename(selected.name))
    setArtist("")
    setError(null)
  }

  function readMetadata(media: HTMLAudioElement) {
    if (!Number.isFinite(media.duration) || media.duration <= 0) {
      setError("The browser could not determine this file’s duration.")
      setDurationSeconds(null)
      return
    }
    setDurationSeconds(media.duration)
    setError(null)
  }

  function useSource() {
    if (!file || !objectUrl || durationSeconds === null || !title.trim()) return

    onSourceReady({
      kind: "local_file",
      externalId: null,
      normalizedUrl: null,
      durationSeconds,
      availability: "local_file_required",
      searchMetadata: {
        title: title.trim(),
        artist: artist.trim() || null,
      },
      originalMetadata: {
        filename: file.name,
        mimeType: file.type || null,
        sizeBytes: file.size,
        lastModified: file.lastModified,
      },
      capabilities: {
        requiresVisiblePlayer: false,
        supportsSeeking: true,
        portableAcrossDevices: false,
      },
      provenance: {
        provider: "local_file",
        inspectedAt: new Date().toISOString(),
      },
    })
  }

  const ready = !!file && !!objectUrl && durationSeconds !== null && !!title.trim()

  return (
    <div>
      <span className={styles.step}>STEP 3 OF 5 · CHOOSE LOCAL AUDIO</span>
      <h2 id="add-track-title">Choose audio from this device</h2>
      <p className={styles.intro}>
        The browser opens this file through a temporary local URL. UtaStream
        does not read its bytes into application code or send them over HTTP.
      </p>

      <label className={styles.filePicker}>
        <span>{file ? "Choose a different file" : "Choose audio file"}</span>
        <input
          type="file"
          accept="audio/*,.aac,.flac,.m4a,.mp3,.ogg,.opus,.wav,.webm"
          onChange={selectFile}
        />
      </label>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {file && objectUrl && (
        <section className={styles.preview} aria-label="Local audio preview">
          <audio
            controls
            preload="metadata"
            src={objectUrl}
            onLoadedMetadata={(event) => readMetadata(event.currentTarget)}
            onError={() => {
              setDurationSeconds(null)
              setError(
                "The browser could not decode this audio file. Choose another file.",
              )
            }}
          />
          <dl>
            <div>
              <dt>File</dt>
              <dd>{file.name}</dd>
            </div>
            <div>
              <dt>Size</dt>
              <dd>{formatBytes(file.size)}</dd>
            </div>
            <div>
              <dt>Duration</dt>
              <dd>
                {durationSeconds === null
                  ? "Reading from the browser…"
                  : formatDuration(durationSeconds)}
              </dd>
            </div>
          </dl>

          <div className={styles.correction}>
            <label>
              Track title
              <input
                value={title}
                required
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <label>
              Artist <span>(optional)</span>
              <input
                value={artist}
                onChange={(event) => setArtist(event.target.value)}
              />
            </label>
          </div>
        </section>
      )}

      <footer className={styles.actions}>
        <button type="button" onClick={onBack}>
          Review guidance
        </button>
        <button
          className={styles.primary}
          type="button"
          disabled={!ready}
          onClick={useSource}
        >
          Continue with this file
        </button>
      </footer>
    </div>
  )
}

function formatDuration(durationSeconds: number) {
  const minutes = Math.floor(durationSeconds / 60)
  const seconds = Math.floor(durationSeconds % 60)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
