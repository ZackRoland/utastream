import { formatTrackDuration } from "../lib/formatTrackDuration"
import type { LibraryTrack } from "../api/libraryApi"
import {
  getPlayableYouTubeSource,
  getPreferredSource,
  type LibraryPlaybackSource,
  youtubeThumbnailUrl,
} from "../lib/libraryPlayback"
import styles from "./ImportedLibrary.module.css"
import { MusicCard } from "./MusicCard"

type Props = {
  items: LibraryTrack[]
  activeTrackId?: string | null
  onPlay?: (
    track: LibraryTrack,
    source: LibraryPlaybackSource & { externalId: string },
  ) => void
  onReviewLyrics?: (item: LibraryTrack, source: LibraryPlaybackSource) => void
}

export function ImportedLibrary({
  items,
  activeTrackId = null,
  onPlay,
  onReviewLyrics,
}: Props) {
  if (!items.length) return null

  return (
    <section className={styles.library} aria-labelledby="imported-library-title">
      <header>
        <span>YOUR PERSISTED LIBRARY</span>
        <h2 id="imported-library-title">Tracks you added</h2>
      </header>
      <div className={styles.grid}>
        {items.map((item) => {
          const playableSource = getPlayableYouTubeSource(item)
          const selected = item.trackId === activeTrackId
          const preferredSource = getPreferredSource(item)
          const sourceLabel = playableSource ? "YouTube" : "Local file"
          const descriptiveMetadata = [
            item.artist,
            item.album,
            sourceLabel,
            formatTrackDuration(item.durationSeconds),
          ].filter(Boolean).join(" · ")

          return (
            <div className={styles.cardGroup} key={item.libraryItemId}>
              <MusicCard
                artwork={playableSource ? (
                  <img
                    src={youtubeThumbnailUrl(playableSource.externalId)}
                    alt={`${item.title} YouTube thumbnail`}
                  />
                ) : (
                  <span className={styles.fallbackArtwork} aria-hidden="true">
                    <span>{initialsFor(item.title)}</span>
                    <small>{item.artist}</small>
                  </span>
                )}
                title={item.title}
                details={descriptiveMetadata}
                status={
                  playableSource
                    ? item.lyrics ? "Lyrics ready" : "Lyrics unavailable"
                    : "Local file required"
                }
                selected={selected}
                disabled={!playableSource}
                onSelect={() => {
                  if (playableSource) onPlay?.(item, playableSource)
                }}
              />
              {onReviewLyrics && preferredSource && preferredSource.kind !== "fixture" && (
                <button
                  className={styles.reviewLyrics}
                  type="button"
                  onClick={() => onReviewLyrics?.(item, preferredSource)}
                >
                  Review/change lyrics
                </button>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function initialsFor(title: string): string {
  return Array.from(title.trim()).slice(0, 2).join("").toUpperCase() || "♪"
}
