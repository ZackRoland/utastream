import { useEffect, useRef } from "react"

import {
  LibraryApi,
  type LibraryPlaybackSource,
  type LibraryTrack,
} from "../../catalog"
import type { PlaybackSourceProbe } from "../model/trackImport"
import dialogStyles from "./AddTrackFlow.module.css"
import { LyricMatchStep, type LyricLookup } from "./LyricMatchStep"

const api = new LibraryApi()
const DEVELOPMENT_USER_ID = "00000000-0000-0000-0000-000000000001"

type Props = {
  track: LibraryTrack
  source: LibraryPlaybackSource
  onClose: () => void
  onChanged: (item: LibraryTrack) => void
  lyricLookup?: LyricLookup
}

export function ChangeLyricsDialog({
  track,
  source,
  onClose,
  onChanged,
  lyricLookup,
}: Props) {
  const closeButton = useRef<HTMLButtonElement>(null)

  useEffect(() => closeButton.current?.focus(), [])
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [onClose])

  if (source.kind === "fixture") return null
  const sourceProbe: PlaybackSourceProbe = {
    kind: source.kind,
    externalId: source.externalId,
    normalizedUrl: source.normalizedUrl,
    durationSeconds: source.durationSeconds,
    availability:
      source.availability === "local_file_required"
        ? "local_file_required"
        : "available",
    searchMetadata: { title: track.title, artist: track.artist },
    originalMetadata: {},
    capabilities: {
      requiresVisiblePlayer: Boolean(source.capabilities.requiresVisiblePlayer),
      supportsSeeking: Boolean(source.capabilities.supportsSeeking),
      portableAcrossDevices: Boolean(source.capabilities.portableAcrossDevices),
    },
    provenance: {
      provider: source.kind,
      inspectedAt: new Date().toISOString(),
    },
  }

  return (
    <section
      className={dialogStyles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label={`Review/change lyrics for ${track.title}`}
    >
      <div className={dialogStyles.panel}>
        <header className={dialogStyles.header}>
          <span>LIBRARY LYRICS</span>
          <button
            ref={closeButton}
            className={dialogStyles.close}
            type="button"
            aria-label="Close lyric review"
            onClick={onClose}
          >
            ×
          </button>
        </header>
        <LyricMatchStep
          sourceProbe={sourceProbe}
          onReplace={onClose}
          lookup={lyricLookup}
          purpose="replacement"
          initialMetadata={{
            title: track.title,
            artist: track.artist,
            album: track.album,
          }}
          initialOffsetMs={track.lyrics?.timingOffsetMs ?? 0}
          currentProviderRecordId={track.lyrics?.sourceRecordId}
          persistReplacement={(request) =>
            api.replaceLyrics(
              DEVELOPMENT_USER_ID,
              track.trackId,
              source.id,
              request,
            )
          }
          onImported={onChanged}
        />
      </div>
    </section>
  )
}
