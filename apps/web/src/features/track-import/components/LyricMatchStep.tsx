import { useMemo, useState } from "react"

import {
  LyricsApi,
  type LyricCandidate,
  type LyricCandidateQuery,
  type LyricCandidateResponse,
} from "../../lyrics/api/lyricsApi"
import type { PlaybackSourceProbe } from "../model/trackImport"
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
}

const api = new LyricsApi()

export function LyricMatchStep({
  sourceProbe,
  onReplace,
  lookup = (query) => api.getCandidates(query),
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
  const [failed, setFailed] = useState(false)
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)

  const selected = useMemo(
    () => response?.candidates.find((candidate) => candidate.providerRecordId === selectedId),
    [response, selectedId],
  )

  async function search() {
    if (!title.trim() || !artist.trim()) return
    setLoading(true)
    setFailed(false)
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
    } catch {
      setFailed(true)
      setResponse(null)
    } finally {
      setLoading(false)
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
          Increment 9 will persist this confirmation and attach the playback
          source to the source-neutral library track.
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
        Confirm the recording and timing. Playback remains usable if lookup is
        missing or temporarily unavailable.
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

      {(failed || response?.status === "unavailable") && (
        <p className={styles.failure} role="alert">
          Lyrics are temporarily unavailable. Playback is unaffected; retry later.
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
            disabled={!selected}
            onClick={() => selected && setConfirmation({
              candidate: selected,
              timingOffsetMs: offsetMs,
              confirmedAt: new Date().toISOString(),
            })}
          >
            Confirm recording and lyrics
          </button>
        </section>
      )}
    </div>
  )
}
