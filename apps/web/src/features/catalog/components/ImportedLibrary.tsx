import type { LibraryTrack } from "../api/libraryApi"
import {
  getPlayableYouTubeSource,
  type LibraryPlaybackSource,
  youtubeThumbnailUrl,
} from "../lib/libraryPlayback"
import styles from "./ImportedLibrary.module.css"

type Props = {
  items: LibraryTrack[]
  activeTrackId?: string | null
  onPlay?: (
    track: LibraryTrack,
    source: LibraryPlaybackSource & { externalId: string },
  ) => void
}

export function ImportedLibrary({ items, activeTrackId = null, onPlay }: Props) {
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
          return (
            <article
              className={`${styles.card} ${selected ? styles.selected : ""}`}
              key={item.libraryItemId}
            >
              {playableSource && (
                <img
                  className={styles.artwork}
                  src={youtubeThumbnailUrl(playableSource.externalId)}
                  alt={`${item.title} YouTube thumbnail`}
                />
              )}
              <div className={styles.metadata}>
                <h3>{item.title}</h3>
                <p>{item.artist}</p>
              </div>
              <dl>
                <div>
                  <dt>Playback sources</dt>
                  <dd>{item.sources.length}</dd>
                </div>
                <div>
                  <dt>Lyrics</dt>
                  <dd>
                    {item.lyrics
                      ? `Version ${item.lyrics.version}`
                      : "Unavailable"}
                  </dd>
                </div>
              </dl>
              <ul>
                {item.sources.map((source) => (
                  <li key={source.id}>
                    <strong>
                      {source.kind === "youtube" ? "YouTube" : "Local file"}
                    </strong>
                    <span>
                      {source.availability === "local_file_required"
                        ? "Local file required"
                        : "Available"}
                    </span>
                  </li>
                ))}
              </ul>
              {playableSource ? (
                <button
                  className={styles.play}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onPlay?.(item, playableSource)}
                >
                  {selected
                    ? "Player open"
                    : `Play ${item.title} with YouTube`}
                </button>
              ) : (
                <p className={styles.unavailable}>
                  Reselect a local file to play this track.
                </p>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
