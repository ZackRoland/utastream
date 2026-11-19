import type { LibraryTrack } from "../api/libraryApi"
import styles from "./ImportedLibrary.module.css"

type Props = { items: LibraryTrack[] }

export function ImportedLibrary({ items }: Props) {
  if (!items.length) return null

  return (
    <section className={styles.library} aria-labelledby="imported-library-title">
      <header>
        <span>YOUR PERSISTED LIBRARY</span>
        <h2 id="imported-library-title">Tracks you added</h2>
      </header>
      <div className={styles.grid}>
        {items.map((item) => (
          <article className={styles.card} key={item.libraryItemId}>
            <div>
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
                <dd>{item.lyrics ? `Version ${item.lyrics.version}` : "Unavailable"}</dd>
              </div>
            </dl>
            <ul>
              {item.sources.map((source) => (
                <li key={source.id}>
                  <strong>{source.kind === "youtube" ? "YouTube" : "Local file"}</strong>
                  <span>
                    {source.availability === "local_file_required"
                      ? "Local file required"
                      : "Available"}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
