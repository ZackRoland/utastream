import { useEffect, useRef, useState } from "react"
import {
  Artwork,
  Equalizer,
  Icon,
  IconButton,
  Japanese,
  Logo,
} from "./components"
import { formatTime, heroImage, lyrics, songs, type Song } from "./data"
import LyricsExperience, { type SavedExpression } from "./LyricsExperience"
import usePlayback from "./usePlayback"
import useArtworkAtmosphere from "./useArtworkAtmosphere"
import ProfileHub from "./ProfileHub"
import SecondaryScreen from "./SecondaryScreen"
import useProfileNavigation from "./useProfileNavigation"
import useContentSwipe from "./useContentSwipe"
import useLearningContinuity, {
  expressionKey,
  type StudyBookmark,
} from "./useLearningContinuity"
import WordsWorthReturningTo from "./WordsWorthReturningTo"

type Destination = "Home" | "Search" | "Library"
type Defaults = {
  furigana: "on" | "off" | "adaptive"
  translation: boolean
}
type NavigationItem = {
  name: Destination | "Review"
  icon: string
}
const navigation: NavigationItem[] = [
  { name: "Home", icon: "home" },
  { name: "Search", icon: "search" },
  { name: "Library", icon: "library" },
  { name: "Review", icon: "review" },
]
function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}
const initialSaved: SavedExpression[] = [
  { songId: "yoru", index: 3, deck: "song" },
  { songId: "yoru", index: 6, deck: "Little discoveries" },
]

export default function App() {
  const [destination, setMusicDestination] = useState<Destination>("Home")
  const [song, setSong] = useState<Song>(songs[0])
  const [playerOpen, setPlayerOpen] = useState(false)
  const [lyricsOpen, setLyricsOpen] = useState(false)
  const [expansionAnchor, setExpansionAnchor] = useState<number | null>(null)
  const [studyRequest, setStudyRequest] = useState<StudyBookmark | null>(null)
  const [dialog, setDialog] =
    useState<"queue" | "more" | "notifications" | "create" | null>(null)
  const [favorite, setFavorite] = useState<string[]>(() =>
    readStorage("uta-favorites", ["blue"]),
  )
  const [saved, setSaved] = useState<SavedExpression[]>(() =>
    readStorage("uta-expressions", initialSaved),
  )
  const [defaults, setDefaults] = useState<Defaults>(() =>
    readStorage("uta-defaults", { furigana: "on", translation: false }),
  )
  const [furigana, setFurigana] = useState(defaults.furigana !== "off")
  const [translation, setTranslation] = useState(defaults.translation)
  const [shuffle, setShuffle] = useState(false)
  const [toast, setToast] = useState("")
  const [filter, setFilter] = useState("All")
  const [query, setQuery] = useState("")
  const [searchGenre, setSearchGenre] = useState("")
  const [reviewSession, setReviewSession] = useState(false)
  const [reviewIndex, setReviewIndex] = useState(0)
  const [reviewRevealed, setReviewRevealed] = useState(false)
  const [reviewFinished, setReviewFinished] = useState(false)
  const [reviewDeck, setReviewDeck] = useState("all")
  const [reviewQueue, setReviewQueue] = useState<SavedExpression[]>([])
  const [selectedDeck, setSelectedDeck] = useState("all")
  const [customDecks, setCustomDecks] = useState<string[]>(() =>
    readStorage("uta-decks", ["Little discoveries", "Everyday Japanese"]),
  )
  const [deckName, setDeckName] = useState("")
  const [historyIds, setHistoryIds] = useState(songs.map((item) => item.id))
  const [reduceMotion, setReduceMotion] = useState(false)
  const [largerLyrics, setLargerLyrics] = useState(false)
  const [deviceReduceMotion, setDeviceReduceMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )
  const pageScroll = useRef<HTMLDivElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const p = usePlayback()
  const learning = useLearningContinuity()
  const profileNav = useProfileNavigation()
  const activeNavigation =
    profileNav.layer?.page === "Review" ? "Review" : destination
  const atmosphere = useArtworkAtmosphere(song.image)
  const topOverlayOpen =
    playerOpen || lyricsOpen || dialog !== null || reviewSession
  const backgroundCovered = topOverlayOpen || profileNav.layer !== null
  const transportCovered = topOverlayOpen || profileNav.layer?.page === "hub"
  const rootSwipe = useContentSwipe({
    enabled: !backgroundCovered,
    direction: 1,
    onSwipe: profileNav.openHub,
  })
  const isFavorite = favorite.includes(song.id)
  const deckItems = (deck: string) =>
    deck === "all"
      ? saved
      : saved.filter((item) =>
          deck.startsWith("song:")
            ? item.deck === "song" && item.songId === deck.slice(5)
            : item.deck === deck,
        )
  const reviewItems = reviewQueue
  const reviewItem = reviewItems[reviewIndex]
  const reviewCounts = learning.counts(saved)
  const selectedDeckItems = deckItems(selectedDeck)
  const selectedDeckCounts = learning.counts(selectedDeckItems)
  const selectedDeckSong = songs.find(
    (item) => selectedDeck === `song:${item.id}`,
  )
  const selectedDeckTitle =
    selectedDeck === "all"
      ? "All discoveries"
      : (selectedDeckSong?.title ?? selectedDeck)
  const continueTarget: StudyBookmark = learning.study ?? {
    songId: saved[0]?.songId ?? songs[0].id,
    index: saved[0]?.index ?? 4,
    mode: "B",
  }
  const continueSong =
    songs.find((item) => item.id === continueTarget.songId) ?? songs[0]
  const editorialSongs =
    learning.preferences.discovery === "balanced"
      ? [songs[3], songs[0], songs[1]]
      : [...songs]
          .sort((a, b) => {
            const difference =
              saved.filter((item) => item.songId === b.id).length -
              saved.filter((item) => item.songId === a.id).length
            return learning.preferences.discovery === "familiar"
              ? difference
              : -difference
          })
          .slice(0, 3)

  function setDestination(next: NavigationItem["name"]) {
    if (next === "Review") {
      profileNav.select("Review")
      return
    }
    setMusicDestination(next)
    if (profileNav.layer) profileNav.close()
  }
  function rememberSong(id: string) {
    setHistoryIds((items) => [id, ...items.filter((entry) => entry !== id)])
  }
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const changed = () => setDeviceReduceMotion(media.matches)
    media.addEventListener("change", changed)
    return () => media.removeEventListener("change", changed)
  }, [])
  useEffect(() => {
    document.documentElement.dataset.reduceMotion = String(
      reduceMotion || deviceReduceMotion,
    )
    document.documentElement.dataset.largerLyrics = String(largerLyrics)
    return () => {
      delete document.documentElement.dataset.reduceMotion
      delete document.documentElement.dataset.largerLyrics
    }
  }, [reduceMotion, deviceReduceMotion, largerLyrics])

  useEffect(() => {
    localStorage.setItem("uta-expressions", JSON.stringify(saved))
  }, [saved])
  useEffect(() => {
    localStorage.setItem("uta-defaults", JSON.stringify(defaults))
  }, [defaults])
  useEffect(() => {
    localStorage.setItem("uta-favorites", JSON.stringify(favorite))
  }, [favorite])
  useEffect(() => {
    localStorage.setItem("uta-decks", JSON.stringify(customDecks))
  }, [customDecks])
  useEffect(() => {
    pageScroll.current?.scrollTo({ top: 0 })
    if (destination === "Home") setFilter("All")
  }, [destination])
  useEffect(() => {
    if (selectedDeck === "all") return
    const frame = requestAnimationFrame(() => {
      const context = document.querySelector<HTMLElement>(
        ".selected-deck-context",
      )
      context?.focus({ preventScroll: true })
      context?.scrollIntoView({ block: "center", behavior: "instant" })
    })
    return () => cancelAnimationFrame(frame)
  }, [selectedDeck])
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || lyricsOpen) return
      if (dialog) setDialog(null)
      else if (reviewSession) setReviewSession(false)
      else if (playerOpen) setPlayerOpen(false)
      else if (profileNav.layer) profileNav.close()
    }
    window.addEventListener("keydown", escape)
    return () => window.removeEventListener("keydown", escape)
  }, [
    lyricsOpen,
    dialog,
    reviewSession,
    playerOpen,
    profileNav.layer,
    profileNav.close,
  ])
  useEffect(() => {
    const selector = dialog
      ? ".utility-dialog"
      : reviewSession
        ? ".review-session"
        : lyricsOpen
          ? ".lyrics-overlay"
          : playerOpen
            ? ".player-overlay"
            : profileNav.layer?.page === "hub"
              ? ".profile-hub"
              : profileNav.layer
                ? ".secondary-screen"
                : null
    if (!selector) return
    const previous = document.activeElement as HTMLElement | null
    const modal = document.querySelector<HTMLElement>(selector)
    const getControls = () =>
      [
        ...(modal?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input, select, [tabindex="0"]',
        ) ?? []),
      ].filter(
        (element) =>
          element.getBoundingClientRect().height > 0 &&
          !element.closest("[inert]"),
      )
    const frame = requestAnimationFrame(() =>
      getControls()[0]?.focus({ preventScroll: true }),
    )
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || selector === ".secondary-screen") return
      const controls = getControls()
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !modal?.contains(document.activeElement))
      ) {
        event.preventDefault()
        last?.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !modal?.contains(document.activeElement))
      ) {
        event.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener("keydown", trap)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener("keydown", trap)
      if (previous?.isConnected) previous.focus({ preventScroll: true })
    }
  }, [playerOpen, lyricsOpen, dialog, reviewSession, profileNav.layer])

  function notify(message: string) {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(""), 3200)
  }
  function selectSong(nextSong: Song) {
    if (song.id !== nextSong.id) p.seek(68)
    setSong(nextSong)
    rememberSong(nextSong.id)
    p.play()
    setPlayerOpen(true)
    setDialog(null)
  }
  function changeTrack(direction: number) {
    const index = songs.findIndex((item) => item.id === song.id)
    const next = shuffle
      ? (index + 1 + Math.floor(Math.random() * (songs.length - 1))) %
        songs.length
      : (index + direction + songs.length) % songs.length
    setSong(songs[next])
    rememberSong(songs[next].id)
    p.seek(0)
    p.play()
  }
  function toggleFavorite() {
    setFavorite((items) =>
      isFavorite ? items.filter((id) => id !== song.id) : [...items, song.id],
    )
    notify(isFavorite ? "Removed from Liked songs" : "Added to Liked songs")
  }
  function saveExpression(index: number, deck: string) {
    if (
      saved.some(
        (item) =>
          item.songId === song.id &&
          lyrics[item.index].expression === lyrics[index].expression,
      )
    )
      return
    setSaved((items) => [{ songId: song.id, index, deck }, ...items])
    if (
      !learning.study ||
      learning.study.songId !== song.id ||
      learning.study.index !== index
    ) {
      learning.rememberStudy({ songId: song.id, index, mode: "B" })
    }
  }
  function updateDefaults(next: Defaults) {
    setDefaults(next)
    setFurigana(next.furigana !== "off")
    setTranslation(next.translation)
    notify("Your listening preferences are saved")
  }
  function startReview(deck = "all", resume = false) {
    const entries = deckItems(deck)
    const ready = entries.filter(
      (item) => learning.memory[expressionKey(item)] !== "familiar",
    )
    const remembered = learning.review
    const queue =
      resume && remembered
        ? remembered.keys.flatMap((key) =>
            saved.filter((item) => expressionKey(item) === key),
          )
        : ready.length
          ? ready
          : entries
    if (!queue.length) return
    const cursor =
      resume && remembered ? Math.min(remembered.cursor, queue.length - 1) : 0
    setReviewDeck(deck)
    setReviewQueue(queue)
    setReviewIndex(cursor)
    learning.setReview({ deck, keys: queue.map(expressionKey), cursor })
    setReviewRevealed(false)
    setReviewFinished(false)
    setReviewSession(true)
  }
  function openSource(item: SavedExpression) {
    const source = songs.find((entry) => entry.id === item.songId) ?? songs[0]
    setSong(source)
    learning.rememberStudy({
      songId: item.songId,
      index: item.index,
      mode: "B",
    })
    setStudyRequest(null)
    p.seek(lyrics[item.index].start)
    setPlayerOpen(true)
    setLyricsOpen(true)
    setReviewSession(false)
  }
  function continueLearning(target: StudyBookmark = continueTarget) {
    const source = songs.find((item) => item.id === target.songId) ?? songs[0]
    if (source.id !== song.id) p.seek(lyrics[target.index].start)
    setSong(source)
    setStudyRequest(target)
    setExpansionAnchor(null)
    setPlayerOpen(true)
    setLyricsOpen(true)
    setReviewSession(false)
  }
  function nextReview(outcome: "returning" | "familiar") {
    if (reviewItem) learning.rememberReview(reviewItem, outcome)
    if (reviewIndex + 1 >= reviewItems.length) {
      setReviewFinished(true)
      learning.setReview(null)
    } else {
      setReviewIndex((index) => index + 1)
      learning.setReview({
        deck: reviewDeck,
        keys: reviewItems.map(expressionKey),
        cursor: reviewIndex + 1,
      })
      setReviewRevealed(false)
    }
  }
  function songLearningNote(item: Song) {
    if (learning.study?.songId === item.id)
      return `Continue from line ${learning.study.index + 1}`
    const count = saved.filter((entry) => entry.songId === item.id).length
    return count
      ? `${count} expression${count === 1 ? "" : "s"} saved`
      : item.id === songs[0].id
        ? "Lyrics ready"
        : null
  }
  const songCards = (items: Song[]) => (
    <div className="album-grid">
      {items.map((item) => (
        <button
          className="album-card"
          key={item.id}
          onClick={() => selectSong(item)}
        >
          <div className="album-cover-wrap">
            <Artwork song={item} />
            <span className="album-play">
              <Icon name="play" size={23} />
            </span>
            {item.id === song.id && p.playing && (
              <span className="album-playing">
                <Equalizer />
              </span>
            )}
          </div>
          <h3>{item.title}</h3>
          <p>
            {item.artist} <span>· {item.genre}</span>
          </p>
          {songLearningNote(item) && (
            <small className="song-learning-note">
              <Icon name="lyrics" size={11} />
              {songLearningNote(item)}
            </small>
          )}
        </button>
      ))}
    </div>
  )
  const sectionHeading = (
    title: string,
    detail: string,
    onClick: () => void,
  ) => (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        <p>{detail}</p>
      </div>
      <button className="text-link" onClick={onClick}>
        View all
        <Icon name="arrow" size={16} />
      </button>
    </div>
  )
  const trackList = (items: Song[]) => (
    <div className="track-list">
      {items.map((item, index) => (
        <button
          className="track-row"
          key={item.id}
          onClick={() => selectSong(item)}
        >
          <span className="track-number">
            {song.id === item.id && p.playing ? (
              <Equalizer />
            ) : (
              String(index + 1).padStart(2, "0")
            )}
          </span>
          <Artwork song={item} text={false} />
          <span className="track-info">
            <strong>{item.title}</strong>
            <span>
              {item.artist} · {item.english}
            </span>
            {item.id === songs[0].id && (
              <small className="track-learning-note">
                {songLearningNote(item)}
              </small>
            )}
          </span>
          <span className="track-duration">3:38</span>
          <Icon name="play" size={17} />
        </button>
      ))}
    </div>
  )

  return (
    <div className="app-shell">
      <aside
        className="sidebar"
        inert={transportCovered}
        aria-hidden={transportCovered}
      >
        <button
          className="brand-button"
          aria-label="UtaStream home"
          onClick={() => setDestination("Home")}
        >
          <Logo />
        </button>
        <span className="sidebar-label">YOUR SPACE</span>
        <nav aria-label="Main navigation" className="desktop-nav">
          {navigation.map((item) => (
            <button
              key={item.name}
              className={
                activeNavigation === item.name ? "nav-item active" : "nav-item"
              }
              onClick={() => setDestination(item.name)}
            >
              <Icon name={item.icon} />
              <span>{item.name}</span>
              {activeNavigation === item.name && <i />}
            </button>
          ))}
        </nav>
        <div className="sidebar-divider" />
        <div className="sidebar-collection-title">
          <span className="sidebar-label">YOUR COLLECTION</span>
          <IconButton
            name="plus"
            label="Create playlist or deck"
            onClick={() => {
              setDeckName("")
              setDialog("create")
            }}
          />
        </div>
        <button
          className="collection-link"
          onClick={() => {
            setDestination("Library")
            setFilter("Liked songs")
          }}
        >
          <span className="collection-icon liked">
            <Icon name="heart" size={17} />
          </span>
          <span>
            Liked songs<small>{favorite.length} songs</small>
          </span>
        </button>
        <button
          className="collection-link"
          onClick={() => {
            setDestination("Library")
            setFilter("Playlists")
          }}
        >
          <span className="collection-icon evening">
            <Icon name="moon" size={17} />
          </span>
          <span>
            After hours<small>Your evening rotation</small>
          </span>
        </button>
        <button
          className="collection-link"
          onClick={() => {
            setDestination("Library")
            setFilter("Playlists")
          }}
        >
          <span className="collection-icon coastal">
            <Icon name="sun" size={17} />
          </span>
          <span>
            Somewhere slower<small>A little room to breathe</small>
          </span>
        </button>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="tiny-spark">
              <Icon name="plus" size={25} />
            </span>
            <p>
              Good music.
              <br />
              <span>A whole new world of words.</span>
            </p>
          </div>
          <button
            className="account-button"
            aria-label="Open Profile hub for Alex Morgan"
            aria-haspopup="dialog"
            onClick={profileNav.openHub}
          >
            <span className="avatar">A</span>
            <span>
              Alex Morgan<small>Free listener</small>
            </span>
            <Icon name="more" size={19} />
          </button>
        </div>
      </aside>
      <div
        className="workspace"
        inert={backgroundCovered}
        aria-hidden={backgroundCovered}
      >
        <header className="topbar">
          <div className="header-leading-zone">
            <div className="mobile-brand" aria-label="UtaStream">
              <Logo compact />
            </div>
            <div className="desktop-breadcrumb">
              <span>Your soundtrack, a little closer.</span>
            </div>
          </div>
          <div className="header-exclusion-zone" aria-hidden="true" />
          <div className="topbar-actions">
            <span className="local-time">
              <span className="live-dot" />
              MADE FOR YOUR MOMENT
            </span>
            <IconButton
              name="bell"
              label="Notifications"
              onClick={() => setDialog("notifications")}
            />
            <button
              className="avatar small-avatar"
              aria-label="Open Profile hub"
              aria-haspopup="dialog"
              aria-controls="profile-hub"
              aria-expanded={profileNav.layer?.page === "hub"}
              onClick={profileNav.openHub}
            >
              A
            </button>
          </div>
        </header>
        <main className="page-scroll" ref={pageScroll} {...rootSwipe}>
          {destination === "Home" && (
            <div className="home-layout">
              <div className="home-main">
                <div className="page-heading home-heading">
                  <div>
                    <span className="eyebrow">TUNE IN. FEEL MORE.</span>
                    <h1>
                      Good evening, Alex
                      <span className="greeting-moon">
                        <Icon name="moon" size={26} />
                      </span>
                    </h1>
                    <p>
                      A familiar favorite. A new feeling. Your next discovery.
                    </p>
                  </div>
                </div>
                <div className="filter-row">
                  {["All", "Music", "Playlists"].map((item) => (
                    <button
                      key={item}
                      className={`filter-chip ${
                        filter === item ? "selected" : ""
                      }`}
                      onClick={() => setFilter(item)}
                    >
                      {item}
                    </button>
                  ))}
                  <span className="filter-caption">
                    <Icon name="headphones" size={15} />A world worth listening
                    to
                  </span>
                </div>
                {filter !== "Music" && (
                  <section
                    className="feature-hero"
                    style={
                      {
                        "--hero-image": `url("${heroImage}")`,
                      } as React.CSSProperties
                    }
                  >
                    <div className="hero-image" />
                    <div className="hero-content">
                      <span className="hero-eyebrow">
                        <span />
                        THE EVENING EDIT
                      </span>
                      <h2>
                        Get lost in
                        <br />
                        the right <em>sound.</em>
                      </h2>
                      <p>
                        City lights. Open windows. Japanese sounds
                        <br className="desktop-only" /> for wherever the night
                        takes you.
                      </p>
                      <button
                        className="button accent hero-button"
                        onClick={() => selectSong(songs[0])}
                      >
                        <Icon name="play" size={18} />
                        Play the mix
                      </button>
                      <span className="hero-bottom">
                        24 TRACKS <i /> 1 HR 26 MIN{" "}
                        <span>CURATED BY UTASTREAM</span>
                      </span>
                    </div>
                    <div className="hero-vertical" lang="ja">
                      音楽と、もう少し遠くへ。
                    </div>
                    <span className="hero-edition">
                      VOL.<strong>024</strong>
                    </span>
                  </section>
                )}
                {filter !== "Playlists" && (
                  <section className="music-section">
                    {sectionHeading(
                      "Back in your rotation",
                      "Some songs feel like coming home.",
                      () => {
                        setDestination("Library")
                        setFilter("Recently played")
                      },
                    )}
                    {songCards(songs)}
                  </section>
                )}
                <section className="music-section mood-section">
                  {sectionHeading(
                    filter === "Playlists"
                      ? "Find your next favorite mix"
                      : "A mood for every moment",
                    "Press play. Let the rest follow.",
                    () => {
                      setDestination("Search")
                      setSearchGenre("")
                    },
                  )}
                  <div className="mood-grid">
                    <button
                      className="mood-card mood-night"
                      onClick={() => selectSong(songs[2])}
                    >
                      <img src={heroImage} alt="" />
                      <span className="eyebrow">THE CITY IS STILL AWAKE</span>
                      <h3>
                        After hours<span>夜の散歩</span>
                      </h3>
                      <span className="mood-card-bottom">
                        City pop · Indie · Late-night sounds
                        <Icon name="arrow" size={21} />
                      </span>
                    </button>
                    <button
                      className="mood-card mood-sea"
                      onClick={() => selectSong(songs[1])}
                    >
                      <img src={songs[1].image} alt="" />
                      <span className="eyebrow">TAKE THE SCENIC ROUTE</span>
                      <h3>
                        Somewhere slower<span>ひと息つこう</span>
                      </h3>
                      <span className="mood-card-bottom">
                        Dream pop · Acoustic · Soft mornings
                        <Icon name="arrow" size={21} />
                      </span>
                    </button>
                  </div>
                </section>
                <section className="music-section discovery-section">
                  {sectionHeading(
                    learning.preferences.discovery === "familiar"
                      ? "A familiar sound, a new detail"
                      : "A little off the beaten track",
                    learning.preferences.discovery === "familiar"
                      ? "A few voices you know. A little more to hear."
                      : learning.preferences.discovery === "new"
                        ? "Fresh voices, with room for a new discovery."
                        : "Independent voices, waiting to be found.",
                    () => {
                      setDestination("Search")
                      setSearchGenre("Indie pop")
                    },
                  )}
                  {trackList(editorialSongs)}
                </section>
                <WordsWorthReturningTo
                  saved={saved}
                  ready={reviewCounts.due + reviewCounts.new}
                  onContinue={() => continueLearning()}
                  onExpression={(item) =>
                    continueLearning({
                      songId: item.songId,
                      index: item.index,
                      mode: "B",
                    })
                  }
                  onReview={() => profileNav.select("Review")}
                />
                <footer className="page-footer">
                  <Logo compact />
                  <span>
                    Made for the love of music. And everything it opens up.
                  </span>
                  <span>UTASTREAM © 2025</span>
                </footer>
              </div>
              <aside className="home-rail">
                <div className="rail-heading">
                  <span className="eyebrow">ON YOUR WAVELENGTH</span>
                  <Icon name="headphones" size={18} />
                </div>
                <div
                  className="rail-cover"
                  onClick={() => selectSong(songs[0])}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ")
                      selectSong(songs[0])
                  }}
                >
                  <Artwork song={songs[0]} />
                  <span className="rail-cover-tag">
                    <span className="live-dot" />
                    IN THE SPOTLIGHT
                  </span>
                  <button
                    className="play-button"
                    aria-label="Play Beyond the Night"
                    onClick={(event) => {
                      event.stopPropagation()
                      selectSong(songs[0])
                    }}
                  >
                    <Icon name="play" />
                  </button>
                </div>
                <div className="rail-feature-heading">
                  <div>
                    <h3>Meet your next repeat.</h3>
                    <p>haruno is finding light in the late hours.</p>
                  </div>
                  <Icon name="arrow" size={19} />
                </div>
                <p className="rail-description">
                  Warm synths, quiet streets, and words that stay with you. Step
                  into the world of an independent Japanese artist.
                </p>
                <button
                  className="rail-listen"
                  onClick={() => selectSong(songs[0])}
                >
                  Listen to haruno
                  <Icon name="arrow" size={16} />
                </button>
                <div className="rail-divider" />
                <div className="rail-heading">
                  <span className="eyebrow">UP NEXT FOR YOU</span>
                  <span className="subtle">01—03</span>
                </div>
                <div className="rail-tracks">
                  {songs.slice(1).map((item) => (
                    <button key={item.id} onClick={() => selectSong(item)}>
                      <Artwork song={item} text={false} />
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.artist}</small>
                      </span>
                      <Icon name="plus" size={17} />
                    </button>
                  ))}
                </div>
                <div className="rail-note">
                  <Icon name="globe" size={22} />
                  <h3>A song is a way in.</h3>
                  <p>
                    Listen a little closer.
                    <br />
                    There’s a whole world in the words.
                  </p>
                  <span lang="ja">音楽で、つながる。</span>
                </div>
              </aside>
            </div>
          )}

          {destination === "Search" && (
            <div className="standard-page">
              <div className="page-heading">
                <span className="eyebrow">FOLLOW YOUR CURIOSITY</span>
                <h1>Find your next feeling.</h1>
                <p>A song, an artist, a whole new world.</p>
              </div>
              <div className="search-input-wrap">
                <Icon name="search" />
                <input
                  autoFocus
                  placeholder="Songs, artists, or a little inspiration"
                  aria-label="Search music"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                {query && (
                  <IconButton
                    name="close"
                    label="Clear search"
                    onClick={() => setQuery("")}
                  />
                )}
              </div>
              {!query && (
                <>
                  <h2 className="browse-heading">
                    Go where the mood takes you
                  </h2>
                  <div className="genre-grid">
                    {[
                      "Indie pop",
                      "City pop",
                      "Dream pop",
                      "Acoustic",
                      "Late-night",
                      "New discoveries",
                    ].map((genre, index) => (
                      <button
                        className={`genre-card genre-${index} ${
                          searchGenre === genre ? "genre-selected" : ""
                        }`}
                        key={genre}
                        onClick={() =>
                          setSearchGenre(searchGenre === genre ? "" : genre)
                        }
                      >
                        <span className="eyebrow">
                          {String(index + 1).padStart(2, "0")} / EXPLORE
                        </span>
                        <h3>{genre}</h3>
                        <Icon
                          name={
                            [
                              "music",
                              "moon",
                              "globe",
                              "sun",
                              "headphones",
                              "arrow",
                            ][index]
                          }
                          size={42}
                        />
                      </button>
                    ))}
                  </div>
                </>
              )}
              <div className="section-heading">
                <h2>
                  {query
                    ? `Results for “${query}”`
                    : searchGenre || "Worth a listen"}
                </h2>
                {searchGenre && (
                  <button
                    className="text-link"
                    onClick={() => setSearchGenre("")}
                  >
                    Clear filter
                  </button>
                )}
              </div>
              {(() => {
                const results = songs.filter((item) =>
                  query
                    ? `${item.title} ${item.english} ${item.artist} ${item.genre}`
                        .toLowerCase()
                        .includes(query.toLowerCase())
                    : searchGenre &&
                        [
                          "Indie pop",
                          "City pop",
                          "Dream pop",
                          "Acoustic",
                        ].includes(searchGenre)
                      ? item.genre === searchGenre
                      : true,
                )
                return results.length ? (
                  trackList(results)
                ) : (
                  <div className="empty-state">
                    <Icon name="search" size={32} />
                    <h3>No songs just yet.</h3>
                    <p>Try “haruno”, “night”, or a different sound.</p>
                  </div>
                )
              })()}
            </div>
          )}

          {destination === "Library" && (
            <div className="standard-page">
              <div className="page-heading heading-with-action">
                <div>
                  <span className="eyebrow">ALWAYS WITH YOU</span>
                  <h1>Your kind of collection.</h1>
                  <p>The sounds you keep coming back to.</p>
                </div>
                <IconButton
                  name="plus"
                  label="Create a collection"
                  onClick={() => setDialog("create")}
                />
              </div>
              <div className="filter-row">
                {["All", "Liked songs", "Playlists", "Recently played"].map(
                  (item) => (
                    <button
                      className={`filter-chip ${
                        filter === item ? "selected" : ""
                      }`}
                      key={item}
                      onClick={() => setFilter(item)}
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>
              {filter === "Liked songs" ? (
                <>
                  <div className="library-liked">
                    <span className="collection-icon liked">
                      <Icon name="heart" size={38} />
                    </span>
                    <div>
                      <span className="eyebrow">YOUR FAVORITES</span>
                      <h2>Liked songs</h2>
                      <p>{favorite.length} songs that feel like you.</p>
                    </div>
                  </div>
                  {favorite.length ? (
                    trackList(
                      songs.filter((item) => favorite.includes(item.id)),
                    )
                  ) : (
                    <div className="empty-state">
                      <p>Tap the heart on any song to make it yours.</p>
                      <button
                        className="button accent"
                        onClick={() => setDestination("Home")}
                      >
                        Find a favorite
                      </button>
                    </div>
                  )}
                </>
              ) : filter === "Playlists" ? (
                <div className="mood-grid library-moods">
                  {[
                    { title: "After hours", image: heroImage, song: songs[0] },
                    {
                      title: "Somewhere slower",
                      image: songs[1].image,
                      song: songs[1],
                    },
                  ].map((mix) => (
                    <button
                      className="mood-card"
                      key={mix.title}
                      onClick={() => selectSong(mix.song)}
                    >
                      <img src={mix.image} alt="" />
                      <span className="eyebrow">YOUR PLAYLIST</span>
                      <h3>{mix.title}</h3>
                      <span className="mood-card-bottom">
                        24 songs · Made for you
                        <Icon name="play" />
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <div className="section-heading">
                    <h2>
                      {filter === "Recently played"
                        ? "Recently played"
                        : "Albums on repeat"}
                    </h2>
                    <span className="subtle">4 albums</span>
                  </div>
                  {songCards(songs)}
                  <div className="section-heading library-decks-heading">
                    <h2>A few words worth keeping</h2>
                    <button
                      className="text-link"
                      onClick={() => profileNav.select("Review")}
                    >
                      Your decks
                      <Icon name="arrow" size={16} />
                    </button>
                  </div>
                  <button
                    className="library-review-link"
                    onClick={() => profileNav.select("Review")}
                  >
                    <span className="collection-icon evening">
                      <Icon name="review" />
                    </span>
                    <span>
                      <strong>Words from your music</strong>
                      <small>
                        {saved.length} expressions · Always connected to a song
                      </small>
                    </span>
                    <Icon name="arrow" />
                  </button>
                </>
              )}
            </div>
          )}

          {profileNav.layer?.page === "Review" && (
            <SecondaryScreen
              title="Decks & Review"
              inactive={topOverlayOpen}
              onHub={profileNav.openHub}
              onClose={profileNav.close}
            >
              <div className="standard-page review-page">
                <div className="page-heading">
                  <span className="eyebrow">A LITTLE MORE MEANING</span>
                  <h1>The words that stayed.</h1>
                  <p>Your music. Your discoveries. Yours to come back to.</p>
                </div>
                <section className="continue-learning-card">
                  <div className="continue-learning-heading">
                    <Icon name="bookmark" size={18} />
                    <span className="eyebrow">
                      {learning.study
                        ? "YOUR PLACE IS KEPT"
                        : "A DISCOVERY TO PICK UP AGAIN"}
                    </span>
                  </div>
                  <div className="continue-learning-source">
                    <Artwork song={continueSong} text={false} />
                    <div>
                      <h2>Continue learning</h2>
                      <p lang="ja">{lyrics[continueTarget.index].expression}</p>
                      <span>
                        {continueSong.title} · {continueSong.artist} · Line{" "}
                        {continueTarget.index + 1} ·{" "}
                        {formatTime(lyrics[continueTarget.index].start)}
                      </span>
                    </div>
                  </div>
                  <button
                    className="continue-learning-action"
                    onClick={() => continueLearning()}
                  >
                    <Icon name="focus" size={17} />
                    {learning.study
                      ? `Continue from line ${continueTarget.index + 1}`
                      : "Explore this sentence"}
                    <Icon name="arrow" size={17} />
                  </button>
                </section>
                <section className="review-banner">
                  <div className="review-banner-icon">
                    <Icon name="review" size={35} />
                  </div>
                  <div>
                    <span className="eyebrow">AT YOUR OWN PACE</span>
                    <h2>
                      {learning.review
                        ? "A few words, right where you left them."
                        : "Words worth another listen."}
                    </h2>
                    <p>
                      {learning.review
                        ? `Your place is kept at expression ${learning.review.cursor + 1} of ${learning.review.keys.length}.`
                        : "Discoveries from your listening. A little context, whenever you want it."}
                    </p>
                    <div className="review-readiness">
                      <span>{reviewCounts.due} due</span>
                      <span>{reviewCounts.new} new</span>
                      <span>{reviewCounts.familiar} getting familiar</span>
                    </div>
                    <button
                      className="button accent"
                      onClick={() =>
                        startReview(
                          learning.review?.deck ?? "all",
                          Boolean(learning.review),
                        )
                      }
                    >
                      <Icon
                        name={learning.review ? "replay" : "review"}
                        size={18}
                      />
                      {learning.review
                        ? "Continue review"
                        : "Review when ready"}
                    </button>
                  </div>
                  <span className="review-banner-jp" lang="ja">
                    言葉を、
                    <br />
                    もう一度。
                  </span>
                </section>
                <div className="section-heading">
                  <div>
                    <h2>From your songs</h2>
                    <p>Every word has a soundtrack.</p>
                  </div>
                  <span className="subtle">SONG DECKS</span>
                </div>
                <div className="decks-grid">
                  {songs
                    .filter((item) =>
                      saved.some(
                        (entry) =>
                          entry.songId === item.id && entry.deck === "song",
                      ),
                    )
                    .map((item) => {
                      const entries = saved.filter(
                        (entry) =>
                          entry.songId === item.id && entry.deck === "song",
                      )
                      const counts = learning.counts(entries)
                      return (
                        <button
                          className="song-deck"
                          key={item.id}
                          onClick={() => setSelectedDeck(`song:${item.id}`)}
                          aria-pressed={selectedDeck === `song:${item.id}`}
                        >
                          <Artwork song={item} />
                          <div>
                            <span className="eyebrow">SONG DECK</span>
                            <h3>{item.title}</h3>
                            <p>
                              {item.artist} · {item.english}
                            </p>
                            <span className="deck-count">
                              <span>{counts.due} due</span>
                              <span>{counts.new} new</span>
                              {counts.familiar > 0 && (
                                <span>{counts.familiar} familiar</span>
                              )}
                            </span>
                          </div>
                          <Icon name="arrow" size={20} />
                        </button>
                      )
                    })}
                </div>
                <div className="section-heading">
                  <h2>Make it your own</h2>
                  <button
                    className="text-link"
                    onClick={() => {
                      setDeckName("")
                      setDialog("create")
                    }}
                  >
                    <Icon name="plus" size={17} />
                    New deck
                  </button>
                </div>
                <div className="custom-decks">
                  {customDecks.map((deck, index) => {
                    const entries = saved.filter((entry) => entry.deck === deck)
                    const counts = learning.counts(entries)
                    return (
                      <button
                        className="custom-deck"
                        key={deck}
                        onClick={() => setSelectedDeck(deck)}
                        aria-pressed={selectedDeck === deck}
                      >
                        <span
                          className={`collection-icon ${
                            index % 2 ? "coastal" : "evening"
                          }`}
                        >
                          <Icon name={index % 2 ? "globe" : "bookmark"} />
                        </span>
                        <div>
                          <h3>{deck}</h3>
                          <p>
                            {entries.length
                              ? `${counts.due} due · ${counts.new} new · ${counts.familiar} familiar`
                              : "Room for your next discovery"}
                          </p>
                        </div>
                        <Icon name="arrow" size={18} />
                      </button>
                    )
                  })}
                </div>
                <div className="section-heading">
                  <div>
                    <h2>
                      {selectedDeck === "all"
                        ? "Recent discoveries"
                        : selectedDeckTitle}
                    </h2>
                    <p>A little context makes a word your own.</p>
                  </div>
                  {selectedDeck !== "all" && (
                    <button
                      className="text-link"
                      onClick={() => setSelectedDeck("all")}
                    >
                      All discoveries
                      <Icon name="close" size={14} />
                    </button>
                  )}
                </div>
                {selectedDeck !== "all" && (
                  <section className="selected-deck-context" tabIndex={-1}>
                    <span className="eyebrow">
                      {selectedDeckSong
                        ? `${selectedDeckSong.artist} · SONG DECK`
                        : "YOUR OWN COLLECTION"}
                    </span>
                    <p>
                      {selectedDeckCounts.due} due · {selectedDeckCounts.new}{" "}
                      new · {selectedDeckCounts.familiar} getting familiar
                    </p>
                    <div>
                      <button
                        className="button accent"
                        disabled={!selectedDeckItems.length}
                        onClick={() => startReview(selectedDeck)}
                      >
                        Review when ready
                        <Icon name="arrow" size={16} />
                      </button>
                      {selectedDeckItems[0] && (
                        <button
                          className="text-link"
                          onClick={() =>
                            continueLearning({
                              songId: selectedDeckItems[0].songId,
                              index: selectedDeckItems[0].index,
                              mode: "B",
                            })
                          }
                        >
                          <Icon name="focus" size={16} />
                          Explore a saved lyric
                        </button>
                      )}
                    </div>
                    {!selectedDeckItems.length && (
                      <p>
                        Room for your next discovery. Save a line while
                        listening to bring it here.
                      </p>
                    )}
                  </section>
                )}
                <div className="saved-list">
                  {selectedDeckItems.map((item, index) => {
                    const source =
                      songs.find((entry) => entry.id === item.songId) ??
                      songs[0]
                    const line = lyrics[item.index]
                    return (
                      <div
                        className="saved-expression"
                        key={`${item.songId}-${item.index}-${index}`}
                      >
                        <div>
                          <span className="saved-discovery-state">
                            {learning.memory[expressionKey(item)] === "familiar"
                              ? "GETTING FAMILIAR"
                              : learning.memory[expressionKey(item)] ===
                                  "returning"
                                ? "WORTH RETURNING TO"
                                : "A NEW DISCOVERY"}
                          </span>
                          <h3 lang="ja">{line.expression}</h3>
                          <p>{line.meaning}</p>
                          <button
                            className="source-link"
                            onClick={() => openSource(item)}
                          >
                            <Icon name="music" size={13} />
                            {source.title} · {source.artist}
                            <span>
                              Line {item.index + 1} · {formatTime(line.start)}
                            </span>
                            <Icon name="arrow" size={13} />
                          </button>
                        </div>
                        <span className="saved-deck-tag">
                          {item.deck === "song" ? "Song deck" : item.deck}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <p className="supportive-note">
                  <Icon name="headphones" size={17} />
                  Some days you listen. Some days you look a little closer. Both
                  count.
                </p>
              </div>
            </SecondaryScreen>
          )}

          {profileNav.layer?.page === "History" && (
            <SecondaryScreen
              title="Recents & listening history"
              inactive={topOverlayOpen}
              onHub={profileNav.openHub}
              onClose={profileNav.close}
            >
              <div className="standard-page listening-history-page">
                <div className="page-heading">
                  <span className="eyebrow">SOME SOUNDS STAY WITH YOU</span>
                  <h1>Your listening trail.</h1>
                  <p>A familiar favorite is never far away.</p>
                </div>
                <div className="history-intro">
                  <Icon name="history" size={26} />
                  <div>
                    <h2>Back through your rotation</h2>
                    <p>Your latest listens, with the most recent first.</p>
                  </div>
                  <span>{historyIds.length} songs</span>
                </div>
                {trackList(
                  historyIds
                    .map((id) => songs.find((item) => item.id === id)!)
                    .filter(Boolean),
                )}
                <p className="supportive-note">
                  <Icon name="wave" size={18} />
                  New listens update this trail for the current session.
                </p>
              </div>
            </SecondaryScreen>
          )}

          {profileNav.layer?.page === "Profile" && (
            <SecondaryScreen
              title="Settings & account"
              section={profileNav.layer.section}
              inactive={topOverlayOpen}
              onHub={profileNav.openHub}
              onClose={profileNav.close}
            >
              <div className="standard-page profile-page">
                <div className="page-heading">
                  <span className="eyebrow">MAKE YOURSELF AT HOME</span>
                  <h1>Your listening space.</h1>
                  <p>A few little things, just the way you like them.</p>
                </div>
                <section className="profile-card" id="account-summary">
                  <span className="avatar profile-avatar">A</span>
                  <div>
                    <h2>Alex Morgan</h2>
                    <p>Here for the music. Curious about the words.</p>
                    <span className="profile-plan">FREE LISTENER</span>
                  </div>
                </section>
                <div className="section-heading" id="lyrics-settings">
                  <div>
                    <h2>Lyrics, your way</h2>
                    <p>These defaults are remembered on this device.</p>
                  </div>
                  <Icon name="lyrics" />
                </div>
                <div className="settings-group">
                  <div className="setting-copy">
                    <span className="setting-symbol" lang="ja">
                      あ
                    </span>
                    <div>
                      <h3>Furigana by default</h3>
                      <p>A little help reading the kanji.</p>
                    </div>
                  </div>
                  <div className="segmented-control">
                    {(["on", "off", "adaptive"] as const).map((value) => (
                      <button
                        key={value}
                        className={defaults.furigana === value ? "active" : ""}
                        aria-pressed={defaults.furigana === value}
                        onClick={() =>
                          updateDefaults({ ...defaults, furigana: value })
                        }
                      >
                        {value === "on"
                          ? "Always on"
                          : value === "off"
                            ? "Off"
                            : "Adaptive"}
                      </button>
                    ))}
                  </div>
                  <p className="setting-description">
                    {defaults.furigana === "adaptive"
                      ? "Readings stay visible in live lyrics; hide them in focused study for a little extra practice."
                      : defaults.furigana === "on"
                        ? "Readings appear above kanji. You can still hide them for any song."
                        : "Just the original words. Turn readings on any time in lyrics."}
                  </p>
                  <div className="setting-divider" />
                  <div className="setting-toggle-row">
                    <div className="setting-copy">
                      <Icon name="globe" />
                      <div>
                        <h3>Show translations</h3>
                        <p>Start lyrics with an English translation.</p>
                      </div>
                    </div>
                    <button
                      className={`switch ${defaults.translation ? "on" : ""}`}
                      aria-label="Show translations by default"
                      role="switch"
                      aria-checked={defaults.translation}
                      onClick={() =>
                        updateDefaults({
                          ...defaults,
                          translation: !defaults.translation,
                        })
                      }
                    >
                      <span />
                    </button>
                  </div>
                </div>
                <div className="section-heading" id="learning-settings">
                  <div>
                    <h2>Learning preferences</h2>
                    <p>A little more meaning, only when you want it.</p>
                  </div>
                  <Icon name="focus" />
                </div>
                <div className="settings-group">
                  <div className="setting-copy">
                    <Icon name="music" />
                    <div>
                      <h3>Your discovery route</h3>
                      <p>
                        A gentle influence on occasional music recommendations.
                      </p>
                    </div>
                  </div>
                  <div className="segmented-control">
                    {(["familiar", "balanced", "new"] as const).map((value) => (
                      <button
                        key={value}
                        className={
                          learning.preferences.discovery === value
                            ? "active"
                            : ""
                        }
                        aria-pressed={learning.preferences.discovery === value}
                        onClick={() =>
                          learning.setPreferences({
                            ...learning.preferences,
                            discovery: value,
                          })
                        }
                      >
                        {value === "familiar"
                          ? "Familiar"
                          : value === "balanced"
                            ? "A balance"
                            : "Discover"}
                      </button>
                    ))}
                  </div>
                  <p className="setting-description">
                    {learning.preferences.discovery === "familiar"
                      ? "Lean toward voices you’ve saved words from."
                      : learning.preferences.discovery === "new"
                        ? "Give unfamiliar voices a little more room."
                        : "An open mix, with a familiar voice now and then."}
                  </p>
                  <div className="setting-divider" />
                  <div className="setting-toggle-row">
                    <div className="setting-copy">
                      <Icon name="globe" />
                      <div>
                        <h3>Context in focused study</h3>
                        <p>
                          Start focused sentences with their translation. Live
                          lyrics keep their own control.
                        </p>
                      </div>
                    </div>
                    <button
                      className={`switch ${
                        learning.preferences.focusedTranslation ? "on" : ""
                      }`}
                      role="switch"
                      aria-label="Show translation in focused study"
                      aria-checked={learning.preferences.focusedTranslation}
                      onClick={() =>
                        learning.setPreferences({
                          ...learning.preferences,
                          focusedTranslation:
                            !learning.preferences.focusedTranslation,
                        })
                      }
                    >
                      <span />
                    </button>
                  </div>
                </div>
                <div className="section-heading" id="playback-settings">
                  <div>
                    <h2>Playback preferences</h2>
                    <p>Keep your sound just the way you like it.</p>
                  </div>
                  <Icon name="headphones" />
                </div>
                <div className="settings-group">
                  <div className="setting-toggle-row">
                    <div className="setting-copy">
                      <Icon name="shuffle" />
                      <div>
                        <h3>Shuffle</h3>
                        <p>Mix up what comes next.</p>
                      </div>
                    </div>
                    <button
                      className={`switch ${shuffle ? "on" : ""}`}
                      role="switch"
                      aria-label="Shuffle playback"
                      aria-checked={shuffle}
                      onClick={() => setShuffle(!shuffle)}
                    >
                      <span />
                    </button>
                  </div>
                  <div className="setting-divider" />
                  <div className="setting-toggle-row">
                    <div className="setting-copy">
                      <Icon name="repeat" />
                      <div>
                        <h3>Repeat this song</h3>
                        <p>Some sounds deserve another listen.</p>
                      </div>
                    </div>
                    <button
                      className={`switch ${p.repeat ? "on" : ""}`}
                      role="switch"
                      aria-label="Repeat current song"
                      aria-checked={p.repeat}
                      onClick={() => p.setRepeat(!p.repeat)}
                    >
                      <span />
                    </button>
                  </div>
                  <div className="setting-divider" />
                  <label className="preference-volume">
                    <span>
                      <Icon name="volume" size={21} />
                      Listening volume
                    </span>
                    <input
                      className="timeline"
                      aria-label="Listening volume"
                      type="range"
                      min="0"
                      max="1"
                      step=".01"
                      value={p.volume}
                      onChange={(event) =>
                        p.setVolume(Number(event.target.value))
                      }
                    />
                  </label>
                </div>
                <div className="section-heading" id="accessibility-settings">
                  <div>
                    <h2>Accessibility preferences</h2>
                    <p>A more comfortable place to listen and read.</p>
                  </div>
                  <Icon name="accessibility" />
                </div>
                <div className="settings-group">
                  <div className="setting-toggle-row">
                    <div className="setting-copy">
                      <Icon name="wave" />
                      <div>
                        <h3>Reduce motion</h3>
                        <p>
                          {deviceReduceMotion
                            ? "Already enabled in your device settings."
                            : "Use still transitions and quieter indicators."}
                        </p>
                      </div>
                    </div>
                    <button
                      className={`switch ${
                        reduceMotion || deviceReduceMotion ? "on" : ""
                      }`}
                      role="switch"
                      aria-label="Reduce motion"
                      aria-checked={reduceMotion || deviceReduceMotion}
                      disabled={deviceReduceMotion}
                      onClick={() => setReduceMotion(!reduceMotion)}
                    >
                      <span />
                    </button>
                  </div>
                  <div className="setting-divider" />
                  <div className="setting-toggle-row">
                    <div className="setting-copy">
                      <Icon name="lyrics" />
                      <div>
                        <h3>Larger lyric text</h3>
                        <p>More room for every character and reading.</p>
                      </div>
                    </div>
                    <button
                      className={`switch ${largerLyrics ? "on" : ""}`}
                      role="switch"
                      aria-label="Larger lyric text"
                      aria-checked={largerLyrics}
                      onClick={() => setLargerLyrics(!largerLyrics)}
                    >
                      <span />
                    </button>
                  </div>
                </div>
                <div className="section-heading" id="help-settings">
                  <h2>Help & About</h2>
                </div>
                <div className="help-questions">
                  <details>
                    <summary>How do I open my Profile hub?</summary>
                    <p>
                      Use the avatar in the header, or deliberately swipe right
                      across the main content of Home, Search, or Library. Start
                      away from the screen edge. Carousels, sliders, and nested
                      screens keep their own gestures.
                    </p>
                  </details>
                  <details>
                    <summary>Does looking at a lyric stop the music?</summary>
                    <p>
                      No. Open a line for its meaning while the song continues.
                      Sentence replay keeps a separate bookmark, so Return to
                      live lyrics takes you back to the song.
                    </p>
                  </details>
                  <details>
                    <summary>Where can I find my saved words?</summary>
                    <p>
                      Open Decks & Review from the Profile hub. Every saved
                      expression stays connected to its source song and lyric.
                    </p>
                  </details>
                </div>
                <div className="about-card">
                  <Logo />
                  <p>Music first. Meaning whenever you want it.</p>
                  <p>
                    UtaStream is a listening prototype featuring fictional
                    artists, original Japanese lyrics, and a gentle original
                    instrumental demo. No vocals are included in this preview.
                  </p>
                  <span className="eyebrow">PROTOTYPE · V.01</span>
                </div>
              </div>
            </SecondaryScreen>
          )}
        </main>
      </div>

      <div
        className="persistent-player"
        inert={transportCovered}
        aria-hidden={transportCovered}
      >
        <button
          className="mini-track"
          onClick={() => setPlayerOpen(true)}
          aria-label={`Open now playing: ${song.title}`}
        >
          <Artwork song={song} text={false} />
          <span>
            <strong>{song.title}</strong>
            <small>
              {song.artist}
              <span className="mini-track-dot"> · </span>
              <span className="mini-track-english">{song.english}</span>
            </small>
          </span>
          <Equalizer playing={p.playing} />
        </button>
        <IconButton
          name="heart"
          label={isFavorite ? "Unlike song" : "Like song"}
          active={isFavorite}
          className="mini-favorite"
          onClick={toggleFavorite}
        />
        <div className="desktop-playback">
          <div className="desktop-play-controls">
            <IconButton
              name="shuffle"
              label="Toggle shuffle"
              active={shuffle}
              onClick={() => setShuffle(!shuffle)}
            />
            <IconButton
              name="previous"
              label="Previous song"
              onClick={() => changeTrack(-1)}
            />
            <button
              className="play-button"
              aria-label={p.playing ? "Pause music" : "Play music"}
              onClick={p.toggle}
            >
              <Icon name={p.playing ? "pause" : "play"} size={20} />
            </button>
            <IconButton
              name="next"
              label="Next song"
              onClick={() => changeTrack(1)}
            />
            <IconButton
              name="repeat"
              label="Toggle repeat"
              active={p.repeat}
              onClick={() => p.setRepeat(!p.repeat)}
            />
          </div>
          <div className="desktop-timeline">
            <span>{formatTime(p.time)}</span>
            <input
              className="timeline"
              aria-label="Playback position"
              type="range"
              min="0"
              max="218"
              step=".25"
              value={p.time}
              onChange={(event) => p.seek(Number(event.target.value))}
              style={
                {
                  "--progress": `${(p.time / 218) * 100}%`,
                } as React.CSSProperties
              }
            />
            <span>3:38</span>
          </div>
        </div>
        <div className="player-extras">
          <IconButton
            name="lyrics"
            label="Open lyrics"
            onClick={() => {
              setPlayerOpen(true)
              setLyricsOpen(true)
            }}
          />
          <IconButton
            name="queue"
            label="Open queue"
            onClick={() => setDialog("queue")}
          />
          <Icon name="volume" size={18} />
          <input
            className="volume-slider timeline"
            aria-label="Volume"
            type="range"
            min="0"
            max="1"
            step=".01"
            value={p.volume}
            onChange={(event) => p.setVolume(Number(event.target.value))}
          />
          <IconButton
            name="expand"
            label="Expand now playing"
            onClick={() => setPlayerOpen(true)}
          />
        </div>
        <div className="mobile-playback">
          <IconButton
            name={p.playing ? "pause" : "play"}
            label={p.playing ? "Pause music" : "Play music"}
            onClick={p.toggle}
          />
          <IconButton
            name="next"
            label="Next song"
            onClick={() => changeTrack(1)}
          />
        </div>
        <div
          className="mobile-mini-progress"
          style={{ width: `${(p.time / 218) * 100}%` }}
        />
      </div>
      <nav
        className="mobile-nav"
        aria-label="Mobile navigation"
        inert={transportCovered}
        aria-hidden={transportCovered}
      >
        {navigation.map((item) => (
          <button
            key={item.name}
            className={activeNavigation === item.name ? "active" : ""}
            onClick={() => setDestination(item.name)}
          >
            <Icon name={item.icon} size={22} />
            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      {profileNav.layer?.page === "hub" && (
        <ProfileHub
          song={song}
          playing={p.playing}
          time={p.time}
          savedCount={saved.length}
          onSelect={profileNav.select}
          onClose={profileNav.close}
        />
      )}

      {playerOpen && (
        <div
          className={`player-overlay ${lyricsOpen ? "behind-lyrics" : ""}`}
          style={atmosphere}
          inert={lyricsOpen || dialog !== null || reviewSession}
          aria-hidden={lyricsOpen || dialog !== null || reviewSession}
          role="dialog"
          aria-modal={!lyricsOpen}
          aria-label="Now playing"
        >
          <div
            className="player-background"
            style={{ backgroundImage: `url("${song.image}")` }}
          />
          <header className="now-playing-header">
            <IconButton
              name="chevron"
              label="Close now playing"
              onClick={() => setPlayerOpen(false)}
            />
            <div>
              <span className="eyebrow">PLAYING FROM YOUR EVENING MIX</span>
              <span>Let the night unfold.</span>
            </div>
            <IconButton
              name="more"
              label="Song options"
              onClick={() => setDialog("more")}
            />
          </header>
          <div className="now-playing-scroll">
            <div className="now-playing-body">
              <div className="now-playing-art">
                <Artwork song={song} />
                <div className="album-footnote">
                  <span>ORIGINAL SOUNDS, NEW PERSPECTIVES.</span>
                  <span>UT—024</span>
                </div>
              </div>
              <div className="now-playing-details">
                <div className="song-title-row">
                  <div>
                    <h1>{song.title}</h1>
                    <p>
                      {song.artist}
                      <span>·</span>
                      {song.english}
                    </p>
                  </div>
                  <IconButton
                    name={isFavorite ? "check" : "plus"}
                    label={
                      isFavorite ? "Remove from favorites" : "Save to favorites"
                    }
                    active={isFavorite}
                    onClick={toggleFavorite}
                    className="favorite-circle"
                  />
                </div>
                <div className="player-timeline">
                  <input
                    className="timeline"
                    aria-label="Now playing position"
                    type="range"
                    min="0"
                    max="218"
                    step=".25"
                    value={p.time}
                    onChange={(event) => p.seek(Number(event.target.value))}
                    style={
                      {
                        "--progress": `${(p.time / 218) * 100}%`,
                      } as React.CSSProperties
                    }
                  />
                  <div>
                    <span>{formatTime(p.time)}</span>
                    <span>3:38</span>
                  </div>
                </div>
                <div className="now-playing-controls">
                  <IconButton
                    name="shuffle"
                    label="Shuffle"
                    active={shuffle}
                    onClick={() => setShuffle(!shuffle)}
                  />
                  <IconButton
                    name="previous"
                    label="Previous track"
                    onClick={() => changeTrack(-1)}
                  />
                  <button
                    className="play-button large"
                    aria-label={p.playing ? "Pause" : "Play"}
                    onClick={p.toggle}
                  >
                    <Icon name={p.playing ? "pause" : "play"} size={28} />
                  </button>
                  <IconButton
                    name="next"
                    label="Next track"
                    onClick={() => changeTrack(1)}
                  />
                  <IconButton
                    name="repeat"
                    label="Repeat song"
                    active={p.repeat}
                    onClick={() => p.setRepeat(!p.repeat)}
                  />
                </div>
                <div className="now-playing-actions">
                  <span>
                    <Icon name="headphones" size={16} />
                    {p.replayIndex !== null
                      ? "Sentence replay"
                      : "Enjoy the moment"}
                  </span>
                  <div>
                    <IconButton
                      name="volume"
                      label="Mute or unmute"
                      onClick={() => p.setVolume(p.volume ? 0 : 0.55)}
                      active={p.volume === 0}
                    />
                    <IconButton
                      name="queue"
                      label="Open play queue"
                      onClick={() => setDialog("queue")}
                    />
                  </div>
                </div>
                <section className="embedded-lyrics">
                  <div className="embedded-heading">
                    <span>
                      <Icon name="lyrics" size={18} />
                      Lyrics
                    </span>
                    <button
                      className="expand-lyrics-button"
                      onClick={() => {
                        const line = document.querySelector(
                          ".embedded-lines .current .japanese",
                        )
                        setExpansionAnchor(
                          line?.getBoundingClientRect().top ?? null,
                        )
                        if (defaults.furigana === "adaptive") setFurigana(true)
                        setLyricsOpen(true)
                      }}
                    >
                      Open lyrics
                      <Icon name="expand" size={17} />
                    </button>
                  </div>
                  <div className="embedded-lines">
                    {lyrics
                      .slice(Math.max(0, p.liveIndex - 1), p.liveIndex + 2)
                      .map((line) => (
                        <p
                          key={line.start}
                          className={
                            line.start === lyrics[p.liveIndex].start
                              ? "current"
                              : ""
                          }
                        >
                          <Japanese line={line} furigana={false} />
                          {line.start === lyrics[p.liveIndex].start && (
                            <Equalizer playing={p.playing} />
                          )}
                        </p>
                      ))}
                  </div>
                  <span className="embedded-hint">
                    Stay with the music. Get closer to the words.
                  </span>
                  {learning.study?.songId === song.id && (
                    <button
                      className="embedded-continue-learning"
                      onClick={() => continueLearning(learning.study!)}
                    >
                      <Icon name="focus" size={16} />
                      Continue learning · line {learning.study.index + 1}
                      <Icon name="arrow" size={15} />
                    </button>
                  )}
                </section>
                <section className="about-artist">
                  <div>
                    <span className="eyebrow">BEHIND THE SOUND</span>
                    <h2>A little about {song.artist}</h2>
                    <p>
                      Independent sounds from Japan. Warm melodies, everyday
                      stories, and a little light in unexpected places.
                    </p>
                  </div>
                  <span className="artist-monogram">
                    {song.artist.slice(0, 1)}
                  </span>
                </section>
                <p className="demo-note">
                  Original instrumental demo · Fictional artist & lyrics
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {lyricsOpen && (
        <LyricsExperience
          song={song}
          playback={p}
          atmosphere={atmosphere}
          anchorTop={expansionAnchor}
          furigana={furigana}
          translation={translation}
          adaptive={defaults.furigana === "adaptive"}
          decks={customDecks}
          setFurigana={setFurigana}
          setTranslation={setTranslation}
          saved={saved}
          initialStudy={studyRequest}
          focusedTranslationDefault={learning.preferences.focusedTranslation}
          onStudyPosition={learning.rememberStudy}
          onReturnToSong={(index) => {
            p.playAt(lyrics[index].start)
            setLyricsOpen(false)
            setStudyRequest(null)
          }}
          onSave={saveExpression}
          onClose={() => {
            p.returnToLive()
            setLyricsOpen(false)
            setExpansionAnchor(null)
            setStudyRequest(null)
          }}
        />
      )}

      {dialog && (
        <div className="dialog-backdrop" onClick={() => setDialog(null)}>
          <section
            className={`utility-dialog ${
              dialog === "queue" ? "queue-dialog" : ""
            }`}
            role="dialog"
            aria-modal="true"
            aria-label={
              dialog === "queue"
                ? "Play queue"
                : dialog === "create"
                  ? "Create a deck"
                  : dialog === "notifications"
                    ? "Notifications"
                    : "Song options"
            }
            onClick={(event) => event.stopPropagation()}
          >
            <div className="utility-dialog-heading">
              <h2>
                {dialog === "queue"
                  ? "The night continues."
                  : dialog === "create"
                    ? "A home for your discoveries."
                    : dialog === "notifications"
                      ? "You’re all caught up."
                      : "A little more about this song."}
              </h2>
              <IconButton
                name="close"
                label="Close dialog"
                onClick={() => setDialog(null)}
              />
            </div>
            {dialog === "queue" ? (
              <>
                <span className="eyebrow">NOW PLAYING</span>
                <div className="queue-current">
                  <Artwork song={song} text={false} />
                  <div>
                    <strong>{song.title}</strong>
                    <p>{song.artist}</p>
                  </div>
                  <Equalizer playing={p.playing} />
                </div>
                <span className="eyebrow queue-next-label">
                  UP NEXT · YOUR EVENING MIX
                </span>
                {trackList(songs.filter((item) => item.id !== song.id))}
                <p className="dialog-note">
                  Good things are just around the next track.
                </p>
              </>
            ) : dialog === "create" ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  const name = deckName.trim()
                  if (!name) return
                  if (customDecks.includes(name)) {
                    notify("There’s already a deck with that name")
                    return
                  }
                  setCustomDecks((items) => [...items, name])
                  setDialog(null)
                  profileNav.select("Review")
                  notify(`“${name}” is ready for your discoveries`)
                }}
              >
                <p>Make a personal deck for the words you want to keep.</p>
                <label htmlFor="deck-name">DECK NAME</label>
                <input
                  id="deck-name"
                  placeholder="e.g. Words for wandering"
                  value={deckName}
                  maxLength={40}
                  onChange={(event) => setDeckName(event.target.value)}
                  autoFocus
                  required
                />
                <button className="button accent" type="submit">
                  <Icon name="plus" size={18} />
                  Create deck
                </button>
              </form>
            ) : dialog === "notifications" ? (
              <div className="notification-empty">
                <Icon name="moon" size={42} />
                <p>No noise. Just a good moment to find your next favorite.</p>
                <button
                  className="button secondary"
                  onClick={() => {
                    setDialog(null)
                    setDestination("Home")
                  }}
                >
                  Back to the music
                </button>
              </div>
            ) : (
              <>
                <div className="queue-current">
                  <Artwork song={song} text={false} />
                  <div>
                    <strong>{song.title}</strong>
                    <p>
                      {song.artist} · {song.english}
                    </p>
                  </div>
                </div>
                <button
                  className="menu-action"
                  onClick={() => {
                    toggleFavorite()
                    setDialog(null)
                  }}
                >
                  <Icon name="heart" />
                  {isFavorite
                    ? "Remove from Liked songs"
                    : "Add to Liked songs"}
                </button>
                <button
                  className="menu-action"
                  onClick={() => setDialog("queue")}
                >
                  <Icon name="queue" />
                  See what’s next
                </button>
                <button
                  className="menu-action"
                  onClick={() => {
                    setDialog(null)
                    setLyricsOpen(true)
                  }}
                >
                  <Icon name="lyrics" />
                  Open synchronized lyrics
                </button>
                <p className="dialog-note">
                  An original UtaStream demo. Fictional artist, original lyrics,
                  and a gentle synthesized instrumental preview.
                </p>
              </>
            )}
          </section>
        </div>
      )}

      {reviewSession && (
        <div
          className="review-session"
          role="dialog"
          aria-modal="true"
          aria-label="Review saved expressions"
        >
          <header>
            <button
              className="text-link"
              onClick={() => setReviewSession(false)}
            >
              <Icon name="back" size={20} />
              Your decks
            </button>
            <span className="eyebrow">A LITTLE REVIEW</span>
            <IconButton
              name="close"
              label="Close review"
              onClick={() => setReviewSession(false)}
            />
          </header>
          {reviewFinished || !reviewItem ? (
            <div className="review-complete">
              <span className="review-complete-icon">
                <Icon name="check" size={36} />
              </span>
              <span className="eyebrow">A GOOD PLACE TO PAUSE</span>
              <h1>A little closer to the words.</h1>
              <p>
                You revisited {reviewItems.length} expressions.
                <br />
                Take them with you into your next listen.
              </p>
              {reviewItem && (
                <button
                  className="button accent review-return-song"
                  onClick={() => openSource(reviewItem)}
                >
                  <Icon name="music" size={18} />
                  Return to source lyric
                  <Icon name="arrow" size={17} />
                </button>
              )}
              <button
                className="button accent"
                onClick={() => setReviewSession(false)}
              >
                Back to your discoveries
                <Icon name="arrow" size={18} />
              </button>
            </div>
          ) : (
            <div className="review-session-content">
              <div className="review-progress">
                <span>
                  {reviewIndex + 1} of {reviewItems.length}
                </span>
                <div>
                  <i
                    style={{
                      width: `${((reviewIndex + 1) / reviewItems.length) * 100}%`,
                    }}
                  />
                </div>
                <span>No rush.</span>
              </div>
              <span className="eyebrow">DOES THIS SOUND FAMILIAR?</span>
              <div className="review-source-context">
                <Artwork
                  song={
                    songs.find((item) => item.id === reviewItem.songId) ??
                    songs[0]
                  }
                  text={false}
                />
                <div>
                  <strong>
                    {songs.find((item) => item.id === reviewItem.songId)?.title}
                  </strong>
                  <span>
                    {
                      songs.find((item) => item.id === reviewItem.songId)
                        ?.artist
                    }{" "}
                    · Line {reviewItem.index + 1} ·{" "}
                    {formatTime(lyrics[reviewItem.index].start)}
                  </span>
                </div>
                <span className="saved-deck-tag">
                  {reviewItem.deck === "song" ? "Song deck" : reviewItem.deck}
                </span>
              </div>
              <div className="review-question">
                <Japanese line={lyrics[reviewItem.index]} furigana={furigana} />
                <div className="review-target-expression">
                  <span className="eyebrow">THE EXPRESSION YOU FOUND</span>
                  <span lang="ja">{lyrics[reviewItem.index].expression}</span>
                </div>
                <button
                  className="source-link"
                  onClick={() => openSource(reviewItem)}
                >
                  <Icon name="music" size={15} />
                  Return to source lyric ·{" "}
                  {formatTime(lyrics[reviewItem.index].start)}
                  <Icon name="arrow" size={15} />
                </button>
              </div>
              {reviewRevealed ? (
                <div className="review-answer">
                  <h2>{lyrics[reviewItem.index].translation}</h2>
                  <p lang="ja">{lyrics[reviewItem.index].reading}</p>
                  <div className="grammar-block">
                    <h3>{lyrics[reviewItem.index].grammarTitle}</h3>
                    <p>{lyrics[reviewItem.index].grammar}</p>
                  </div>
                  <p className="subtle">How did that feel?</p>
                  <div className="review-answer-actions">
                    <button
                      className="button secondary"
                      onClick={() => {
                        nextReview("returning")
                      }}
                    >
                      A little more practice
                    </button>
                    <button
                      className="button accent"
                      onClick={() => nextReview("familiar")}
                    >
                      Feels familiar
                      <Icon name="check" size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="button accent reveal-button"
                  onClick={() => setReviewRevealed(true)}
                >
                  Find the meaning
                  <Icon name="arrow" size={18} />
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" size={18} />
          {toast}
        </div>
      )}
    </div>
  )
}
