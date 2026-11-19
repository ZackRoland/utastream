import { FormEvent, useEffect, useRef, useState } from "react"

import type { PlaybackSourceProbe } from "../../model/trackImport"
import type { YouTubeAvailabilityError } from "./youtubeErrors"
import {
  mountYouTubePlayer,
  type YouTubePlayerCallbacks,
  type YouTubePlayerHandle,
} from "./youtubePlayer"
import {
  InvalidYouTubeUrlError,
  parseYouTubeUrl,
  type YouTubeReference,
} from "./youtubeUrl"
import styles from "./YouTubeSourceStep.module.css"
import {
  YouTubeMetadataApi,
  type YouTubeMetadataResponse,
} from "./youtubeMetadataApi"

type MountPlayer = (
  element: HTMLElement,
  videoId: string,
  callbacks: YouTubePlayerCallbacks,
) => Promise<YouTubePlayerHandle>

type YouTubeSourceStepProps = {
  onBack: () => void
  onSourceReady: (sourceProbe: PlaybackSourceProbe) => void
  mountPlayer?: MountPlayer
  lookupMetadata?: (videoId: string) => Promise<YouTubeMetadataResponse>
}

const metadataApi = new YouTubeMetadataApi()
const defaultMetadataLookup = (videoId: string) => metadataApi.getMetadata(videoId)

export function YouTubeSourceStep({
  onBack,
  onSourceReady,
  mountPlayer = mountYouTubePlayer,
  lookupMetadata = defaultMetadataLookup,
}: YouTubeSourceStepProps) {
  const [input, setInput] = useState("")
  const [reference, setReference] = useState<YouTubeReference | null>(null)
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null)
  const [metadata, setMetadata] = useState<YouTubeMetadataResponse | null>(null)
  const [metadataLoading, setMetadataLoading] = useState(false)
  const [inputError, setInputError] = useState<string | null>(null)
  const [playerError, setPlayerError] = useState<YouTubeAvailabilityError | null>(
    null,
  )
  const [loading, setLoading] = useState(false)
  const playerHost = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!reference || !playerHost.current) return

    let active = true
    let handle: YouTubePlayerHandle | null = null
    setLoading(true)
    setDurationSeconds(null)
    setMetadata(null)
    setPlayerError(null)
    setMetadataLoading(true)

    void lookupMetadata(reference.videoId)
      .then((result) => {
        if (active) setMetadata(result)
      })
      .catch(() => {
        if (active) {
          setMetadata({
            status: "unavailable",
            title: null,
            artist: null,
            providerTitle: null,
            providerAuthor: null,
          })
        }
      })
      .finally(() => {
        if (active) setMetadataLoading(false)
      })

    void mountPlayer(playerHost.current, reference.videoId, {
      onReady: (duration) => {
        if (!active) return
        setDurationSeconds(duration)
        setLoading(false)
      },
      onError: (error) => {
        if (!active) return
        setPlayerError(error)
        setLoading(false)
      },
    })
      .then((mounted) => {
        if (active) handle = mounted
        else mounted.destroy()
      })
      .catch(() => {
        if (!active) return
        setPlayerError({
          code: "playback_failed",
          message: "The YouTube player could not be loaded. Check your connection and retry.",
          recoverable: true,
        })
        setLoading(false)
      })

    return () => {
      active = false
      handle?.destroy()
    }
  }, [lookupMetadata, mountPlayer, reference])

  function submit(event: FormEvent) {
    event.preventDefault()
    try {
      const parsed = parseYouTubeUrl(input)
      setInputError(null)
      setReference(parsed)
    } catch (error) {
      setInputError(
        error instanceof InvalidYouTubeUrlError
          ? error.message
          : "The YouTube URL could not be read.",
      )
    }
  }

  function useSource() {
    if (!reference || loading || playerError) return
    onSourceReady({
      kind: "youtube",
      externalId: reference.videoId,
      normalizedUrl: reference.normalizedUrl,
      durationSeconds,
      availability: "available",
      searchMetadata:
        metadata?.status === "ready" && metadata.title && metadata.artist
          ? { title: metadata.title, artist: metadata.artist }
          : null,
      originalMetadata:
        metadata?.status === "ready"
          ? {
              providerTitle: metadata.providerTitle ?? null,
              providerAuthor: metadata.providerAuthor ?? null,
            }
          : {},
      capabilities: {
        requiresVisiblePlayer: true,
        supportsSeeking: true,
        portableAcrossDevices: true,
      },
      provenance: {
        provider: "youtube",
        inspectedAt: new Date().toISOString(),
      },
    })
  }

  return (
    <div>
      <span className={styles.step}>STEP 3 OF 5 · CONNECT YOUTUBE</span>
      <h2 id="add-track-title">Paste a YouTube video link</h2>
      <p className={styles.intro}>
        Loading a preview connects to YouTube, which receives basic request and
        device data. The official player remains visible and in control.
      </p>

      <form className={styles.form} onSubmit={submit} noValidate>
        <label htmlFor="youtube-url">YouTube URL</label>
        <div className={styles.inputRow}>
          <input
            id="youtube-url"
            type="url"
            inputMode="url"
            autoComplete="url"
            value={input}
            aria-describedby={inputError ? "youtube-url-error" : undefined}
            aria-invalid={!!inputError}
            placeholder="https://www.youtube.com/watch?v=…"
            onChange={(event) => setInput(event.target.value)}
          />
          <button type="submit">Load preview</button>
        </div>
        {inputError && (
          <p id="youtube-url-error" className={styles.error} role="alert">
            {inputError}
          </p>
        )}
      </form>

      {reference && (
        <section className={styles.preview} aria-label="YouTube source preview">
          <div className={styles.player} ref={playerHost} />
          {loading && <p className={styles.status}>Preparing the official player…</p>}
          {playerError && (
            <div className={styles.failure} role="alert">
              <strong>Choose another YouTube video</strong>
              <p>{playerError.message}</p>
              <button type="button" onClick={() => setReference(null)}>
                Enter another URL
              </button>
            </div>
          )}
          {!loading && !playerError && (
            <div className={styles.ready} role="status">
              <span>Video available for embedded playback</span>
              <small>
                {durationSeconds === null
                  ? "Duration unavailable"
                  : `${Math.round(durationSeconds)} seconds`}
              </small>
              {metadataLoading && <small>Reading title and artist from YouTube…</small>}
              {!metadataLoading && metadata?.status === "ready" && (
                <strong>{metadata.title} · {metadata.artist}</strong>
              )}
              {!metadataLoading && metadata?.status === "unavailable" && (
                <small>
                  YouTube metadata could not be read. You can enter it manually
                  on the next step.
                </small>
              )}
            </div>
          )}
        </section>
      )}

      <footer className={styles.actions}>
        <button type="button" onClick={onBack}>
          Review guidance
        </button>
        <button
          className={styles.primary}
          type="button"
          disabled={!reference || loading || metadataLoading || !!playerError}
          onClick={useSource}
        >
          Continue with this video
        </button>
      </footer>
    </div>
  )
}
