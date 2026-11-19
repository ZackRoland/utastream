import { useMemo, useState } from "react"

import {
  LyricsApi,
  type LyricCandidate,
  type LyricCandidateQuery,
  type LyricCandidateResponse,
} from "../../lyrics/api/lyricsApi"
import {
  LibraryApi,
  type CompleteTrackImportRequest,
  type CompleteTrackImportResponse,
  type LibraryTrack,
} from "../../catalog/api/libraryApi"
import type { PlaybackSourceProbe } from "../model/trackImport"
import { ApiClientError } from "../../../shared/api"
import styles from "./LyricMatchStep.module.css"

export type LyricLookup = (
  query: LyricCandidateQuery,
) => Promise<LyricCandidateResponse>

type Confirmation = {
  candidate: LyricCandidate
  timingOffsetMs: number
  confirmedAt: string
}

type Props = {
  sourceProbe: PlaybackSourceProbe
  onReplace: () => void
  lookup?: LyricLookup
  persistImport?: (
    request: CompleteTrackImportRequest,
  ) => Promise<CompleteTrackImportResponse>
  onImported?: (item: LibraryTrack) => void
}

const api = new LyricsApi()
const libraryApi = new LibraryApi()
const DEVELOPMENT_USER_ID = "00000000-0000-0000-0000-000000000001"

export function LyricMatchStep({
  sourceProbe,
  onReplace,
  lookup = (query) => api.getCandidates(query),
  persistImport = (request) => libraryApi.completeImport(request),
  onImported,
}: Props) {
  const initial = sourceProbe.searchMetadata
  const [title, setTitle] = useState(initial?.title ?? "")
  const [artist, setArtist] = useState(initial?.artist ?? "")
  const [album, setAlbum] = useState("")
  const [response, setResponse] = useState<LyricCandidateResponse | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(() => new Set())
  const [offsetMs, setOffsetMs] = useState(0)
  const [loading, setLoading] = useState(false)
  const [failureMessage, setFailureMessage] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)

  const selected = useMemo(
    () => response?.candidates.find((candidate) => candidate.providerRecordId === selectedId),
    [response, selectedId],
  )

  async function search() {
    if (!title.trim() || !artist.trim()) return
    setLoading(true)
    setFailureMessage(null)
    setConfirmation(null)
    try {
      const result = await lookup({
        title: title.trim(),
        artist: artist.trim(),
        album: album.trim() || undefined,
        durationSeconds: sourceProbe.durationSeconds ?? undefined,
      })
      setResponse(result)
      const strong = result.candidates.find(
        (candidate) =>
          candidate.confidenceBand === "strong" &&
          !rejectedIds.has(candidate.providerRecordId),
      )
      setSelectedId(strong?.providerRecordId ?? null)
    } catch (error) {
      setFailureMessage(lyricLookupFailureMessage(error))
      setResponse(null)
    } finally {
      setLoading(false)
    }
  }

  async function confirm(candidate: LyricCandidate) {
    setSaving(true)
    setSaveError(false)
    const confirmedAt = new Date().toISOString()
    try {
      const result = await persistImport({
        userId: DEVELOPMENT_USER_ID,
        title: candidate.title,
        artist: candidate.artist,
        album: candidate.album,
        source: {
          kind: sourceProbe.kind,
          availability: sourceProbe.availability,
          externalId: sourceProbe.externalId,
          normalizedUrl: sourceProbe.normalizedUrl,
          durationSeconds:
            sourceProbe.durationSeconds ?? candidate.durationSeconds,
          originalMetadata: sourceProbe.originalMetadata,
          capabilities: sourceProbe.capabilities,
          provenance: sourceProbe.provenance,
        },
        lyrics: {
          providerRecordId: candidate.providerRecordId,
          lyricDocumentVersion: candidate.lyricDocumentVersion,
          normalizedSegments: candidate.normalizedSegments,
          attribution: candidate.attribution,
          rightsCapabilities: candidate.rightsCapabilities,
          score: candidate.score,
          matchingPolicyVersion: candidate.matchingPolicyVersion,
          confirmedAt,
          timingOffsetMs: offsetMs,
          durationDifferenceSeconds: candidate.durationDifferenceSeconds,
        },
      })
      setConfirmation({ candidate, timingOffsetMs: offsetMs, confirmedAt })
      onImported?.(result.item)
    } catch {
      setSaveError(true)
    } finally {
      setSaving(false)
    }
  }

  if (confirmation) {
    return (
      <div className={styles.content}>
        <span className={styles.step}>LYRICS CONFIRMED</span>
        <h2 id="add-track-title">Ready to add to the library</h2>
        <p className={styles.intro}>
          {confirmation.candidate.title} by {confirmation.candidate.artist} is
          confirmed with LRCLIB record {confirmation.candidate.providerRecordId}.
        </p>
        <dl className={styles.summary}>
          <div><dt>Policy</dt><dd>{confirmation.candidate.matchingPolicyVersion}</dd></div>
          <div><dt>Lyric version</dt><dd>{confirmation.candidate.lyricDocumentVersion}</dd></div>
          <div><dt>Confidence</dt><dd>{confirmation.candidate.score}/100</dd></div>
          <div><dt>Timing offset</dt><dd>{confirmation.timingOffsetMs} ms</dd></div>
          <div><dt>Confirmed</dt><dd>{confirmation.confirmedAt}</dd></div>
        </dl>
        <p className={styles.notice}>
          This source and lyric version are now attached to the source-neutral
          library track. Local media bytes were not persisted.
        </p>
        <button type="button" onClick={onReplace}>Replace playback source</button>
      </div>
    )
  }

  return (
    <div className={styles.content}>
      <span className={styles.step}>STEP 5 · MATCH RECORDING AND LYRICS</span>
      <h2 id="add-track-title">Find the right lyrics</h2>
      <p className={styles.intro}>
        Title and artist are filled from the source when available. Correct them
        only if needed, then confirm the recording and timing.
      </p>
      <div className={styles.fields}>
        <label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label>Artist<input value={artist} onChange={(event) => setArtist(event.target.value)} /></label>
        <label>Album <span>(optional)</span><input value={album} onChange={(event) => setAlbum(event.target.value)} /></label>
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={onReplace}>Replace source</button>
        <button
          className={styles.primary}
          type="button"
          disabled={loading || !title.trim() || !artist.trim()}
          onClick={() => void search()}
        >
          {loading ? "Searching…" : "Search lyrics"}
        </button>
      </div>

      {(failureMessage || response?.status === "unavailable") && (
        <p className={styles.failure} role="alert">
          {failureMessage ?? "Lyrics are temporarily unavailable."} Playback is
          unaffected; retry later.
        </p>
      )}
      {(response?.status === "timeout" || response?.status === "overloaded") && (
        <p className={styles.failure} role="alert">
          {response.status === "timeout"
            ? "Lyric lookup timed out."
            : "LRCLIB is temporarily overloaded."}{" "}
          Playback is unaffected; retry later.
        </p>
      )}
      {response?.status === "rate_limited" && (
        <p className={styles.failure} role="alert">
          LRCLIB asked us to wait
          {response.retryAfterSeconds ? ` ${response.retryAfterSeconds} seconds` : ""}.
          Playback is unaffected.
        </p>
      )}
      {response?.status === "missing" && (
        <p className={styles.failure} role="status">
          No lyric candidates found. Correct the metadata or continue listening without lyrics.
        </p>
      )}

      {!!response?.candidates.filter(
        (candidate) => !rejectedIds.has(candidate.providerRecordId),
      ).length && (
        <section className={styles.results} aria-label="Lyric candidates">
          <h3>Confirm a candidate</h3>
          {response.candidates
            .filter((candidate) => !rejectedIds.has(candidate.providerRecordId))
            .map((candidate) => (
              <div className={styles.candidate} key={candidate.providerRecordId}>
                <label>
                  <input
                    type="radio"
                    name="lyric-candidate"
                    checked={selectedId === candidate.providerRecordId}
                    onChange={() => setSelectedId(candidate.providerRecordId)}
                  />
                  <span>
                    <strong>{candidate.title} · {candidate.artist}</strong>
                    <small>{candidate.score}/100 · {candidate.confidenceBand} · {Math.round(candidate.durationSeconds)} seconds</small>
                    {candidate.warnings.map((warning) => <em key={warning}>{warning}</em>)}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setRejectedIds((current) => new Set(current).add(candidate.providerRecordId))
                    if (selectedId === candidate.providerRecordId) setSelectedId(null)
                  }}
                >
                  Reject candidate
                </button>
              </div>
            ))}
          <label className={styles.offset}>
            Timing offset (milliseconds)
            <input
              type="number"
              min={-30000}
              max={30000}
              step={100}
              value={offsetMs}
              onChange={(event) => setOffsetMs(Number(event.target.value))}
            />
          </label>
          <p className={styles.notice}>
            Lyrics supplied by LRCLIB. Provider content remains attributed and
            is not silently accepted, even for a strong score.
          </p>
          <button
            className={styles.confirm}
            type="button"
            disabled={!selected || saving}
            onClick={() => selected && void confirm(selected)}
          >
            {saving ? "Adding to library…" : "Confirm recording and lyrics"}
          </button>
          {saveError && (
            <p className={styles.failure} role="alert">
              The track could not be saved. Your source selection remains here
              so you can retry.
            </p>
          )}
        </section>
      )}
    </div>
  )
}

function lyricLookupFailureMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.code === "network_error"
      ? `${error.message} Start the API process and try again.`
      : error.message
  }
  if (error instanceof TypeError) {
    return "The UtaStream API could not be reached. Start the API process and try again."
  }
  return "The lyric request failed before LRCLIB could be reached."
}
