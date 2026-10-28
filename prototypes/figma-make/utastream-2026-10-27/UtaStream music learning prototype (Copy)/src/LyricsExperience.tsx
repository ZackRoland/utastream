import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react"
import { Artwork, Equalizer, Icon, IconButton, Japanese } from "./components"
import { formatTime, lyrics, type Lyric, type Song } from "./data"
import type usePlayback from "./usePlayback"
import type { StudyBookmark } from "./useLearningContinuity"

export type SavedExpression = {
  songId: string
  index: number
  deck: string
}
type Playback = ReturnType<typeof usePlayback>
type Props = {
  song: Song
  playback: Playback
  atmosphere: CSSProperties
  anchorTop: number | null
  furigana: boolean
  translation: boolean
  adaptive: boolean
  decks: string[]
  setFurigana: (value: boolean) => void
  setTranslation: (value: boolean) => void
  saved: SavedExpression[]
  initialStudy: StudyBookmark | null
  focusedTranslationDefault: boolean
  onStudyPosition: (bookmark: StudyBookmark) => void
  onReturnToSong: (index: number) => void
  onSave: (index: number, deck: string) => void
  onClose: () => void
}

function ListeningState({
  playback: p,
  index,
  following,
  onLive,
}: {
  playback: Playback
  index: number
  following: boolean
  onLive: () => void
}) {
  const replaying = p.replayIndex !== null
  const inspecting = !replaying && (!following || index !== p.songIndex)
  return (
    <div
      className={`listening-state ${
        replaying
          ? "is-replaying"
          : inspecting
            ? "is-inspecting"
            : "is-following"
      }`}
      role="status"
    >
      <Icon
        name={replaying ? "replay" : inspecting ? "bookmark" : "live"}
        size={20}
      />
      <div className="listening-state-copy">
        <span className="listening-state-label">Playback state</span>
        <strong>
          {replaying
            ? `Replaying a sentence · Line ${p.replayIndex! + 1}`
            : inspecting
              ? `Inspecting ${
                  index < p.songIndex
                    ? "earlier "
                    : index > p.songIndex
                      ? "upcoming "
                      : ""
                }line ${index + 1}`
              : "Following live playback"}
        </strong>
        <span className="listening-state-detail">
          {replaying
            ? `${
                p.replayComplete
                  ? "Sentence complete"
                  : p.playing
                    ? "Sentence replay"
                    : "Replay paused"
              } · `
            : ""}
          Live song position: {formatTime(p.liveTime)}
        </span>
      </div>
      {(replaying || inspecting) && (
        <button className="return-live-action" onClick={onLive}>
          <Icon name="live" size={16} />
          <span>Return to live lyrics</span>
        </button>
      )}
    </div>
  )
}

function LearningDetails({
  line,
  index,
  song,
  saved,
  onSave,
  onReplay,
  decks,
  compact = false,
  hideActions = false,
  sentenceMode = false,
}: {
  line: Lyric
  index: number
  song: Song
  saved: boolean
  onSave: (index: number, deck: string) => void
  onReplay: () => void
  decks: string[]
  compact?: boolean
  hideActions?: boolean
  sentenceMode?: boolean
}) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  useEffect(() => setSelectedWord(null), [index])
  const selectedVocabulary = line.vocabulary.find(
    (word) => word.word === selectedWord,
  )
  return (
    <div className={`learning-details ${compact ? "compact" : ""}`}>
      {!sentenceMode && (
        <>
          <div className="expression-heading">
            <span className="eyebrow">IN THIS SONG</span>
            <span className="subtle">Expression</span>
          </div>
          <h3 lang="ja">{line.expression}</h3>
          <div className="expression-reading" lang="ja">
            {line.reading}
          </div>
          <p className="expression-meaning">{line.meaning}</p>
        </>
      )}
      <div className="grammar-block">
        <span className="eyebrow">A LITTLE CONTEXT</span>
        <h4>{line.grammarTitle}</h4>
        <p>{line.grammar}</p>
      </div>
      {!sentenceMode && (
        <p className="contextual-sentence">{line.translation}</p>
      )}
      <div className="vocabulary">
        <span className="eyebrow">WORDS TO KEEP</span>
        {line.vocabulary.map((word) => (
          <button
            className={`vocab-row ${
              selectedWord === word.word ? "selected" : ""
            }`}
            key={word.word}
            aria-pressed={selectedWord === word.word}
            onClick={() =>
              setSelectedWord(selectedWord === word.word ? null : word.word)
            }
          >
            <span lang="ja">
              {word.word}
              <small>{word.reading}</small>
            </span>
            <span>{word.meaning}</span>
          </button>
        ))}
        {selectedVocabulary && (
          <div className="selected-vocabulary-context" role="status">
            <span className="eyebrow">HEARD IN THIS LYRIC</span>
            <h4 lang="ja">
              {selectedVocabulary.word}{" "}
              <small>{selectedVocabulary.reading}</small>
            </h4>
            <p>{selectedVocabulary.meaning}</p>
            <blockquote>{line.translation}</blockquote>
            <button onClick={onReplay}>
              <Icon name="replay" size={16} />
              Hear it in this sentence
            </button>
          </div>
        )}
      </div>
      {!hideActions && (
        <ExpressionActions
          line={line}
          index={index}
          song={song}
          saved={saved}
          onSave={onSave}
          onReplay={onReplay}
          decks={decks}
        />
      )}
    </div>
  )
}

type ExpressionActionProps = {
  line: Lyric
  index: number
  song: Song
  saved: boolean
  onSave: (index: number, deck: string) => void
  onReplay: () => void
  decks: string[]
  hideReplay?: boolean
}
function ExpressionActions({
  line,
  index,
  song,
  saved,
  onSave,
  onReplay,
  decks,
  hideReplay = false,
}: ExpressionActionProps) {
  const [deck, setDeck] = useState("song")
  return (
    <div className="expression-actions">
      {!hideReplay && (
        <button className="sentence-replay" onClick={onReplay}>
          <Icon name="replay" size={19} />
          <span>Replay this sentence</span>
          <small>
            {formatTime(line.start)}–
            {formatTime(lyrics[index + 1]?.start ?? 218)}
          </small>
        </button>
      )}
      <div className="save-row">
        <select
          aria-label="Save to deck"
          value={deck}
          onChange={(event) => setDeck(event.target.value)}
        >
          <option value="song">{song.title} · Song deck</option>
          {decks.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <button
          className={`button accent ${saved ? "saved-button" : ""}`}
          onClick={() => onSave(index, deck)}
          disabled={saved}
          aria-label={saved ? "Expression saved" : "Save expression to deck"}
        >
          <Icon name={saved ? "check" : "plus"} size={18} />
          {saved ? "Saved" : "Save expression"}
        </button>
      </div>
      {saved && (
        <p className="inline-confirmation" role="status">
          <Icon name="check" size={14} />
          Saved with its song and lyric.
        </p>
      )}
    </div>
  )
}

export default function LyricsExperience({
  song,
  playback: p,
  atmosphere,
  anchorTop,
  furigana,
  translation,
  adaptive,
  decks,
  setFurigana,
  setTranslation,
  saved,
  initialStudy,
  focusedTranslationDefault,
  onStudyPosition,
  onReturnToSong,
  onSave,
  onClose,
}: Props) {
  const [variant, setVariant] = useState<"A" | "B" | "C">(
    initialStudy?.mode ?? "A",
  )
  const [selected, setSelected] = useState<number | null>(null)
  const [studyIndex, setStudyIndex] = useState(
    initialStudy?.index ?? p.liveIndex,
  )
  const [following, setFollowing] = useState(!initialStudy)
  const [focusTranslation, setFocusTranslation] = useState(
    focusedTranslationDefault,
  )
  const showTranslation = variant === "B" ? focusTranslation : translation
  const [details, setDetails] = useState(false)
  const [sheetHeight, setSheetHeight] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)
  const activeLine = useRef<HTMLButtonElement>(null)
  const touchStart = useRef(0)
  const dragStart = useRef(0)
  const positioned = useRef(false)
  const previousPlacement = useRef<string | null>(null)
  const positionRequested = useRef(false)
  const focusIndex = following ? p.liveIndex : studyIndex
  const isSaved = (index: number) =>
    saved.some(
      (item) =>
        item.songId === song.id &&
        lyrics[item.index].expression === lyrics[index].expression,
    )

  useEffect(() => {
    if (variant === "B" || variant === "C")
      onStudyPosition({ songId: song.id, index: studyIndex, mode: variant })
  }, [variant, studyIndex, song.id, onStudyPosition])
  useEffect(() => {
    if (initialStudy && adaptive) setFurigana(false)
  }, [initialStudy, adaptive, setFurigana])

  useEffect(() => {
    if (selected === null) return
    onStudyPosition({ songId: song.id, index: selected, mode: "B" })
    const previous = document.activeElement as HTMLElement | null
    const frame = requestAnimationFrame(() =>
      document
        .querySelector<HTMLButtonElement>(
          '.context-sheet button[aria-label="Close expression details"]',
        )
        ?.focus({ preventScroll: true }),
    )
    return () => {
      cancelAnimationFrame(frame)
      previous?.focus({ preventScroll: true })
    }
  }, [selected, song.id, onStudyPosition])

  useEffect(() => {
    if (following) setStudyIndex(p.liveIndex)
  }, [following, p.liveIndex, variant])

  useLayoutEffect(() => {
    if (
      selected !== null ||
      variant !== "A" ||
      (!following && !positionRequested.current)
    )
      return
    const placement = `${focusIndex}:${furigana}:${translation}:${following}`
    if (previousPlacement.current === placement && !positionRequested.current)
      return
    const node = activeLine.current
    const container = scroller.current
    if (node && container) {
      if (previousPlacement.current !== null)
        node.getAnimations().forEach((animation) => animation.cancel())
      const first = !positioned.current
      const bounds = container.getBoundingClientRect()
      const lineBounds = node.getBoundingClientRect()
      const textTop =
        node.querySelector(".japanese")?.getBoundingClientRect().top ??
        lineBounds.top
      const preferredTop =
        first && anchorTop !== null
          ? anchorTop
          : bounds.top + bounds.height * 0.12
      const targetTop = Math.max(
        bounds.top + 8,
        Math.min(
          preferredTop,
          bounds.bottom - Math.min(lineBounds.height, bounds.height - 20),
        ),
      )
      const position = container.scrollTop + textTop - targetTop
      const reducedMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        document.documentElement.dataset.reduceMotion === "true"
      const instant =
        reducedMotion ||
        first ||
        positionRequested.current ||
        !following ||
        Math.abs(position - container.scrollTop) > bounds.height
      if (first && position < 0) {
        container.style.paddingTop = `${parseFloat(getComputedStyle(container).paddingTop) - position}px`
      }
      // The first paint is already at the active line; only natural following glides.
      container.scrollTo({
        top: position,
        behavior: instant ? "instant" : "smooth",
      })
      if (
        first &&
        anchorTop !== null &&
        anchorTop > 0 &&
        anchorTop < window.innerHeight &&
        !reducedMotion
      ) {
        const currentTop =
          node.querySelector(".japanese")?.getBoundingClientRect().top ??
          targetTop
        const distance = anchorTop - currentTop
        node.animate(
          [
            { transform: `translateY(${distance}px)` },
            { transform: "translateY(0)" },
          ],
          { duration: 160, easing: "cubic-bezier(.2,.7,.2,1)" },
        )
      }
      positioned.current = true
      previousPlacement.current = placement
      positionRequested.current = false
    }
  }, [
    focusIndex,
    following,
    selected,
    variant,
    furigana,
    translation,
    anchorTop,
  ])

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape")
        selected !== null ? setSelected(null) : onClose()
    }
    document.addEventListener("keydown", key)
    return () => document.removeEventListener("keydown", key)
  }, [selected, onClose])

  const changeVariant = (value: "A" | "B" | "C") => {
    setVariant(value)
    setSelected(null)
    setDetails(false)
    setStudyIndex(p.liveIndex)
    setFollowing(value !== "B")
    positionRequested.current = true
    if (adaptive) setFurigana(value === "A")
  }
  const changeSentence = (delta: number) => {
    setFollowing(false)
    positionRequested.current = true
    setStudyIndex((index) =>
      Math.max(0, Math.min(lyrics.length - 1, index + delta)),
    )
    setDetails(false)
  }
  const line = lyrics[studyIndex]
  const live = studyIndex === p.songIndex && p.replayIndex === null
  const contextIndex = following ? p.liveIndex : studyIndex
  const contextLine = lyrics[contextIndex]
  const returnLive = () => {
    const index = p.songIndex
    p.returnToLive()
    setSelected(null)
    setStudyIndex(index)
    setFollowing(true)
    setVariant("A")
    if (adaptive) setFurigana(true)
    positionRequested.current = true
  }
  const focusSentence = (index: number) => {
    setStudyIndex(index)
    setSelected(null)
    setFollowing(false)
    setVariant("B")
    if (adaptive) setFurigana(false)
  }

  return (
    <div
      className="lyrics-overlay"
      style={atmosphere}
      role="dialog"
      aria-modal="true"
      aria-label={`Synchronized lyrics for ${song.title}`}
    >
      <div
        className="lyrics-atmosphere"
        style={{ backgroundImage: `url("${song.image}")` }}
      />
      <header
        className="lyrics-header"
        inert={selected !== null}
        aria-hidden={selected !== null}
      >
        <IconButton
          name="chevron"
          label="Collapse lyrics and return to player"
          onClick={onClose}
        />
        <div>
          <span className="eyebrow">THE WORDS BEHIND THE MUSIC</span>
          <h2>
            {song.title} <span>· {song.artist}</span>
          </h2>
        </div>
        <Artwork song={song} text={false} className="lyrics-header-art" />
      </header>
      <div
        className="lyrics-main"
        inert={selected !== null}
        aria-hidden={selected !== null}
      >
        <aside className="lyrics-album">
          <Artwork song={song} />
          <h2>{song.title}</h2>
          <p>
            {song.english} <span>·</span> {song.artist}
          </p>
          <div className="desktop-listening">
            <Equalizer playing={p.playing} />
            <span>
              {p.playing ? "Stay in the music." : "A moment to take it in."}
            </span>
          </div>
          <p className="lyrics-album-note">
            Every song has something to say.
            <br />
            Find the words that stay with you.
          </p>
        </aside>
        <div className={`lyrics-content variant-${variant}`}>
          <div className="lyrics-toolbar">
            <div className="live-indicator">
              <span className={p.playing ? "live-dot" : "paused-dot"} />
              {p.replayIndex !== null
                ? p.playing
                  ? "SENTENCE REPLAY"
                  : "REPLAY PAUSED"
                : p.playing
                  ? "LIVE LYRICS"
                  : "LYRICS PAUSED"}
            </div>
            <div
              className="display-controls"
              role="group"
              aria-label="Lyric reading preferences"
            >
              <span className="control-group-label">Display</span>
              <div className="toggle-group">
                <button
                  aria-pressed={furigana}
                  onClick={() => setFurigana(!furigana)}
                  className={`lyric-toggle ${furigana ? "active" : ""}`}
                >
                  <span lang="ja">あ</span> Furigana
                </button>
                <button
                  aria-pressed={showTranslation}
                  onClick={() =>
                    variant === "B"
                      ? setFocusTranslation(!focusTranslation)
                      : setTranslation(!translation)
                  }
                  className={`lyric-toggle ${showTranslation ? "active" : ""}`}
                >
                  <Icon name="globe" size={15} />
                  Translation
                </button>
              </div>
            </div>
          </div>
          <ListeningState
            playback={p}
            index={contextIndex}
            following={following}
            onLive={returnLive}
          />
          <div className="prototype-switcher">
            <span>LYRIC VIEWS</span>
            <div role="group" aria-label="Choose a lyric experience">
              {(["A", "B", "C"] as const).map((item) => (
                <button
                  key={item}
                  className={variant === item ? "selected" : ""}
                  onClick={() => changeVariant(item)}
                  aria-pressed={variant === item}
                >
                  <b>{item}</b>{" "}
                  {item === "A" ? "Context" : item === "B" ? "Focus" : "Cards"}
                </button>
              ))}
            </div>
          </div>
          {variant === "A" ? (
            <>
              <div
                className="lyric-scroll"
                ref={scroller}
                onWheel={() => setFollowing(false)}
                onTouchMove={() => setFollowing(false)}
              >
                <p className="lyric-hint">
                  <Icon name="music" size={14} />
                  Tap a line. Find a little more meaning.
                </p>
                {lyrics.map((item, index) => (
                  <button
                    key={index}
                    ref={index === focusIndex ? activeLine : undefined}
                    data-line-index={index}
                    className={`lyric-line ${
                      index < p.liveIndex
                        ? "past"
                        : index === p.liveIndex
                          ? "current"
                          : "upcoming"
                    } ${
                      selected === index || (!following && studyIndex === index)
                        ? "line-selected"
                        : ""
                    }`}
                    onClick={(event) => {
                      const container = scroller.current
                      if (container) {
                        const top =
                          container.scrollTop +
                          event.currentTarget.getBoundingClientRect().top -
                          container.getBoundingClientRect().top
                        container.scrollTo({ top, behavior: "instant" })
                      }
                      setSelected(index)
                      setStudyIndex(index)
                      setFollowing(false)
                      setSheetHeight(0)
                    }}
                    aria-label={`${
                      index === p.liveIndex ? "Current lyric. " : ""
                    }${item.parts.map((part) => part.text).join("")} Open explanation`}
                  >
                    <div className="line-timestamp">
                      {index === p.liveIndex ? (
                        <Equalizer playing={p.playing} />
                      ) : (
                        <span>{formatTime(item.start)}</span>
                      )}
                    </div>
                    <div>
                      <Japanese line={item} furigana={furigana} />
                      {translation && (
                        <span className="line-translation">
                          {item.translation}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
                <p className="lyric-end">
                  Words & music by haruno · Original UtaStream demo
                </p>
              </div>
              <section
                className="lyric-context-dock"
                aria-label="Learning actions for the selected sentence"
              >
                <div className="context-dock-title">
                  <span className="control-group-label">Learning actions</span>
                  <span>
                    Selected sentence · Line{" "}
                    {String(contextIndex + 1).padStart(2, "0")} / {lyrics.length}
                  </span>
                </div>
                <div className="context-dock-primary-actions">
                  <button
                    className="context-dock-meaning"
                    onClick={() => {
                      setStudyIndex(contextIndex)
                      setSelected(contextIndex)
                      setFollowing(false)
                    }}
                    aria-label="Explore this line’s meaning and grammar"
                  >
                    <Icon name="help" size={17} />
                    <span>
                      <strong>Explore meaning and grammar</strong>
                      <small>
                        {contextLine.meaning} · {contextLine.grammarTitle}
                      </small>
                    </span>
                    <Icon name="chevron" size={16} />
                  </button>
                  <button
                    className="context-dock-focus"
                    onClick={() => focusSentence(contextIndex)}
                  >
                    <Icon name="focus" size={17} />
                    <span>
                      <strong>Focus sentence</strong>
                      <small>One sentence at a time</small>
                    </span>
                    <Icon name="arrow" size={15} />
                  </button>
                </div>
                <div className="context-dock-actions">
                  <button
                    disabled={contextIndex === 0}
                    onClick={() => changeSentence(-1)}
                  >
                    <Icon name="previous" size={17} />
                    Previous sentence
                  </button>
                  <button
                    className="dock-replay"
                    onClick={() => p.replay(contextIndex)}
                  >
                    <Icon name="replay" size={17} />
                    Replay line
                  </button>
                  <button
                    className={`dock-save ${
                      isSaved(contextIndex) ? "is-saved" : ""
                    }`}
                    disabled={isSaved(contextIndex)}
                    onClick={() => onSave(contextIndex, "song")}
                  >
                    <Icon
                      name={isSaved(contextIndex) ? "check" : "bookmark"}
                      size={17}
                    />
                    {isSaved(contextIndex) ? "Saved" : "Save expression"}
                  </button>
                  <button
                    disabled={contextIndex === lyrics.length - 1}
                    onClick={() => changeSentence(1)}
                  >
                    Next sentence
                    <Icon name="next" size={17} />
                  </button>
                </div>
              </section>
            </>
          ) : (
            <>
              <div
                className="study-scroll"
                role="region"
                aria-label={
                  variant === "B" ? "Focused sentence" : "Lyric cards"
                }
              >
                <div className="study-mode-label">
                  <span className="eyebrow">
                    {variant === "B" ? "ONE SENTENCE AT A TIME" : "LYRIC CARDS"}
                  </span>
                  <span>
                    {studyIndex + 1} / {lyrics.length}
                  </span>
                </div>
                {variant === "B" && (
                  <div className="focused-source-song">
                    <Artwork song={song} text={false} />
                    <div>
                      <strong>
                        {song.title} <span>· {song.artist}</span>
                      </strong>
                      <small>
                        Your place is kept · Line {studyIndex + 1} ·{" "}
                        {formatTime(line.start)}
                      </small>
                    </div>
                    <button onClick={() => onReturnToSong(studyIndex)}>
                      <Icon name="music" size={16} />
                      Play in song
                    </button>
                  </div>
                )}
                <div className={`study-state ${live ? "is-live" : ""}`}>
                  <span className={live ? "live-dot" : "paused-dot"} />
                  {p.replayIndex !== null && studyIndex === p.replayIndex
                    ? p.playing
                      ? `Replaying sentence ${p.replayIndex + 1}`
                      : p.replayComplete
                        ? "Sentence complete · return to your song when ready"
                        : "Sentence replay paused"
                    : !live
                      ? studyIndex < p.songIndex
                        ? "Exploring an earlier sentence"
                        : "Exploring an upcoming sentence"
                      : p.playing
                        ? "With the music"
                        : "At the current sentence"}
                  {!following && (
                    <button
                      onClick={() => {
                        returnLive()
                        setDetails(false)
                      }}
                    >
                      Go live <Icon name="arrow" size={14} />
                    </button>
                  )}
                </div>
                <div
                  className={`sentence-card ${
                    variant === "C" ? "swipe-card" : ""
                  }`}
                  onTouchStart={(event) => {
                    touchStart.current = event.touches[0].clientX
                  }}
                  onTouchEnd={(event) => {
                    if (variant !== "C") return
                    const distance =
                      touchStart.current - event.changedTouches[0].clientX
                    if (Math.abs(distance) > 45)
                      changeSentence(distance > 0 ? 1 : -1)
                  }}
                >
                  <div className="card-meta">
                    <span>{song.title}</span>
                    <span>
                      {formatTime(line.start)}–
                      {formatTime(lyrics[studyIndex + 1]?.start ?? 218)}
                    </span>
                  </div>
                  <Japanese line={line} furigana={furigana} />
                  {showTranslation && (
                    <p className="sentence-translation">{line.translation}</p>
                  )}
                  {variant === "C" && (
                    <button
                      className="card-expand"
                      aria-expanded={details}
                      onClick={() => {
                        if (!details) setFollowing(false)
                        setDetails(!details)
                      }}
                    >
                      <Icon name="plus" size={18} />
                      {details ? "Less detail" : "Explore grammar & vocabulary"}
                      <Icon name="chevron" size={16} />
                    </button>
                  )}
                  {(variant === "B" || details) && (
                    <LearningDetails
                      line={line}
                      index={studyIndex}
                      song={song}
                      saved={isSaved(studyIndex)}
                      onSave={onSave}
                      onReplay={() => p.replay(studyIndex)}
                      decks={decks}
                      compact
                      sentenceMode={variant === "B"}
                      hideActions={variant === "B"}
                    />
                  )}
                  {variant === "C" && !details && (
                    <div className="card-quick-actions">
                      <button
                        className="button secondary"
                        onClick={() => p.replay(studyIndex)}
                      >
                        <Icon name="replay" size={18} />
                        Replay sentence
                      </button>
                      <button
                        className={`button accent ${
                          isSaved(studyIndex) ? "saved-button" : ""
                        }`}
                        onClick={() => onSave(studyIndex, "song")}
                        disabled={isSaved(studyIndex)}
                      >
                        <Icon
                          name={isSaved(studyIndex) ? "check" : "plus"}
                          size={18}
                        />
                        {isSaved(studyIndex) ? "Saved" : "Save"}
                      </button>
                    </div>
                  )}
                </div>
                {variant === "C" && (
                  <div className="sentence-navigation">
                    <button
                      className="button secondary"
                      disabled={studyIndex === 0}
                      onClick={() => changeSentence(-1)}
                    >
                      <Icon name="back" size={18} />
                      Previous
                    </button>
                    <span>
                      {variant === "C"
                        ? "Swipe to explore"
                        : "At your own pace"}
                    </span>
                    <button
                      className="button secondary"
                      disabled={studyIndex === lyrics.length - 1}
                      onClick={() => changeSentence(1)}
                    >
                      Next
                      <Icon name="arrow" size={18} />
                    </button>
                  </div>
                )}
                {variant === "C" && (
                  <button
                    className="return-to-lyrics"
                    onClick={() => {
                      setVariant("A")
                      returnLive()
                      if (adaptive) setFurigana(true)
                    }}
                  >
                    <Icon name="lyrics" size={18} />
                    Return to live lyrics
                  </button>
                )}
              </div>
              {variant === "B" && (
                <section
                  className="focused-sentence-actions"
                  aria-label="Focused sentence learning controls"
                >
                  <div className="focused-replay-navigation">
                    <button
                      aria-label="Previous focused sentence"
                      disabled={studyIndex === 0}
                      onClick={() => changeSentence(-1)}
                    >
                      <Icon name="previous" size={20} />
                      <span>Previous</span>
                    </button>
                    <button
                      className="focused-replay"
                      onClick={() => p.replay(studyIndex)}
                    >
                      <Icon name="replay" size={18} />
                      <span>
                        Replay sentence
                        <small>
                          {formatTime(line.start)}–
                          {formatTime(lyrics[studyIndex + 1]?.start ?? 218)}
                        </small>
                      </span>
                    </button>
                    <button
                      aria-label="Next focused sentence"
                      disabled={studyIndex === lyrics.length - 1}
                      onClick={() => changeSentence(1)}
                    >
                      <Icon name="next" size={20} />
                      <span>Next</span>
                    </button>
                  </div>
                  <ExpressionActions
                    line={line}
                    index={studyIndex}
                    song={song}
                    saved={isSaved(studyIndex)}
                    onSave={onSave}
                    onReplay={() => p.replay(studyIndex)}
                    decks={decks}
                    hideReplay
                  />
                  <button className="focused-return-live" onClick={returnLive}>
                    <Icon name="live" size={17} />
                    Return to live lyrics
                    <Icon name="arrow" size={15} />
                  </button>
                </section>
              )}
            </>
          )}
        </div>
      </div>
      <footer
        className={`lyrics-playback ${
          p.replayIndex !== null ? "replay-transport" : ""
        }`}
        inert={selected !== null}
        aria-hidden={selected !== null}
      >
        <div className="lyric-playback-track">
          <Artwork song={song} text={false} />
          <div>
            <strong>{song.title}</strong>
            <span>
              {p.replayIndex !== null
                ? `Sentence replay · line ${p.replayIndex + 1}`
                : song.artist}
            </span>
          </div>
        </div>
        <span className="lyric-time">
          {formatTime(p.time)} <span>/ 3:38</span>
        </span>
        <input
          aria-label="Lyric playback position"
          className="timeline"
          type="range"
          min="0"
          max="218"
          step="0.25"
          value={p.time}
          style={{ "--progress": `${(p.time / 218) * 100}%` } as CSSProperties}
          onChange={(event) => p.seek(Number(event.target.value))}
        />
        <IconButton
          name="previous"
          label="Previous lyric sentence"
          onClick={() => p.replay(Math.max(0, p.liveIndex - 1))}
        />
        <IconButton
          name="replay"
          label="Replay current sentence"
          onClick={() => p.replay(p.liveIndex)}
        />
        <button
          className="play-button"
          aria-label={p.playing ? "Pause" : "Play"}
          onClick={p.toggle}
        >
          <Icon name={p.playing ? "pause" : "play"} />
        </button>
        <IconButton
          name="next"
          label="Next lyric sentence"
          onClick={() => p.replay(Math.min(p.liveIndex + 1, lyrics.length - 1))}
        />
      </footer>
      {selected !== null && (
        <div className="context-sheet-wrap">
          <button
            className="sheet-backdrop"
            aria-label="Close explanation"
            onClick={() => setSelected(null)}
          />
          <section
            className="context-sheet"
            style={{ transform: `translateY(${sheetHeight}px)` }}
            role="dialog"
            aria-label="Lyric expression details"
          >
            <div
              className="sheet-drag-handle"
              onPointerDown={(event) => {
                dragStart.current = event.clientY
                event.currentTarget.setPointerCapture(event.pointerId)
              }}
              onPointerMove={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId))
                  setSheetHeight(Math.max(0, event.clientY - dragStart.current))
              }}
              onPointerUp={(event) => {
                if (event.clientY - dragStart.current > 100) setSelected(null)
                setSheetHeight(0)
              }}
            >
              <span />
            </div>
            <div className="sheet-heading">
              <ListeningState
                playback={p}
                index={selected}
                following={false}
                onLive={returnLive}
              />
              <IconButton
                name="close"
                label="Close expression details"
                onClick={() => setSelected(null)}
              />
            </div>
            <div className="sheet-content">
              <LearningDetails
                line={lyrics[selected]}
                index={selected}
                song={song}
                saved={isSaved(selected)}
                onSave={onSave}
                onReplay={() => p.replay(selected)}
                decks={decks}
                hideActions
              />
            </div>
            <footer className="sheet-footer">
              <div className="sheet-sentence-navigation">
                <IconButton
                  name="previous"
                  label="Inspect previous sentence in explanation"
                  onClick={() => {
                    const index = Math.max(0, selected - 1)
                    setSelected(index)
                    setStudyIndex(index)
                  }}
                />
                <span>
                  Line {selected + 1} / {lyrics.length}
                </span>
                <IconButton
                  name="next"
                  label="Inspect next sentence in explanation"
                  onClick={() => {
                    const index = Math.min(lyrics.length - 1, selected + 1)
                    setSelected(index)
                    setStudyIndex(index)
                  }}
                />
                <button onClick={() => focusSentence(selected)}>
                  <Icon name="focus" size={16} />
                  Focus sentence
                </button>
              </div>
              <ExpressionActions
                line={lyrics[selected]}
                index={selected}
                song={song}
                saved={isSaved(selected)}
                onSave={onSave}
                onReplay={() => p.replay(selected)}
                decks={decks}
              />
            </footer>
          </section>
        </div>
      )}
    </div>
  )
}
