import { Icon } from "./components"
import { formatTime, lyrics, songs } from "./data"
import type { SavedExpression } from "./LyricsExperience"

type Props = {
  saved: SavedExpression[]
  ready: number
  onContinue: () => void
  onExpression: (item: SavedExpression) => void
  onReview: () => void
}

export default function WordsWorthReturningTo({
  saved,
  ready,
  onContinue,
  onExpression,
  onReview,
}: Props) {
  if (!saved.length) return null
  return (
    <section
      className="words-returning-module"
      aria-labelledby="words-returning-title"
    >
      <header>
        <h2 id="words-returning-title">Words worth returning to</h2>
        <span>{ready ? `${ready} to revisit` : "Yours to revisit"}</span>
      </header>
      <div className="returning-expressions">
        {saved.slice(0, 2).map((item) => {
          const source =
            songs.find((song) => song.id === item.songId) ?? songs[0]
          const line = lyrics[item.index]
          return (
            <button
              className="returning-expression"
              key={`${item.songId}:${item.index}`}
              onClick={() => onExpression(item)}
            >
              <span lang="ja">{line.expression}</span>
              <span>
                <Icon name="music" size={12} />
                {source.title}
                <small>{formatTime(line.start)}</small>
              </span>
              <Icon name="arrow" size={15} />
            </button>
          )
        })}
      </div>
      <footer>
        <button onClick={onContinue}>
          <Icon name="focus" size={16} />
          Continue learning
        </button>
        <button onClick={onReview}>
          Review when ready
          <Icon name="arrow" size={14} />
        </button>
      </footer>
    </section>
  )
}
