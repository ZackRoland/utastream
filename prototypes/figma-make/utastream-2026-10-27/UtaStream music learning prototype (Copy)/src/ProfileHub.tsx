import { Artwork, Equalizer, Icon, IconButton } from "./components"
import { formatTime, type Song } from "./data"
import useContentSwipe from "./useContentSwipe"
import type { SecondaryPage } from "./useProfileNavigation"

type Props = {
  song: Song
  playing: boolean
  time: number
  savedCount: number
  onSelect: (page: SecondaryPage, section?: string | null) => void
  onClose: () => void
}

export default function ProfileHub({
  song,
  playing,
  time,
  savedCount,
  onSelect,
  onClose,
}: Props) {
  const swipe = useContentSwipe({
    enabled: true,
    direction: -1,
    onSwipe: onClose,
  })
  const item = (
    icon: string,
    label: string,
    detail: string,
    page: SecondaryPage,
    section?: string,
  ) => (
    <button className="hub-link" onClick={() => onSelect(page, section)}>
      <span className="hub-link-icon">
        <Icon name={icon} size={21} />
      </span>
      <span>
        <strong>{label}</strong>
        <small>{detail}</small>
      </span>
      <Icon name="arrow" size={16} />
    </button>
  )
  return (
    <div className="profile-hub-layer">
      <button
        className="profile-hub-backdrop"
        aria-label="Close Profile hub and return to music"
        onClick={onClose}
        tabIndex={-1}
      />
      <section
        className="profile-hub"
        id="profile-hub"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-hub-title"
        {...swipe}
      >
        <svg
          className="hub-wave-edge"
          viewBox="0 0 28 900"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 0C26 130-8 240 13 390S-6 650 9 790Q19 860 0 900" />
        </svg>
        <header className="hub-header">
          <div>
            <span className="eyebrow">A SPACE BESIDE THE MUSIC</span>
            <h2 id="profile-hub-title">Your Profile hub.</h2>
          </div>
          <IconButton
            name="close"
            label="Close Profile hub"
            onClick={onClose}
          />
        </header>
        <div className="hub-scroll">
          <button
            className="hub-account"
            onClick={() => onSelect("Profile", "account-summary")}
          >
            <span className="avatar">A</span>
            <span>
              <strong>Alex Morgan</strong>
              <small>Free listener · Your own wavelength</small>
              <span>
                Profile & account <Icon name="arrow" size={13} />
              </span>
            </span>
          </button>
          <nav aria-label="Profile hub navigation">
            <span className="hub-group-label">YOUR MUSIC & YOUR WORDS</span>
            {item(
              "review",
              "Decks & Review",
              `${savedCount} expressions, whenever you’re ready`,
              "Review",
            )}
            {item(
              "history",
              "Recents & listening history",
              "Find your way back to a good sound",
              "History",
            )}
            <span className="hub-group-label">MAKE IT YOURS</span>
            {item(
              "settings",
              "Settings",
              "Your listening space, your way",
              "Profile",
            )}
            {item(
              "headphones",
              "Playback preferences",
              "Sound, shuffle, and repeat",
              "Profile",
              "playback-settings",
            )}
            {item(
              "accessibility",
              "Accessibility",
              "Reading and motion preferences",
              "Profile",
              "accessibility-settings",
            )}
            <span className="hub-group-label">A LITTLE GUIDANCE</span>
            {item(
              "help",
              "Help & About",
              "A few answers, and the idea behind it all",
              "Profile",
              "help-settings",
            )}
          </nav>
          <p className="hub-gesture-hint">
            <Icon name="wave" size={16} />
            Swipe left or use Close to return to your music.
          </p>
        </div>
        <footer className="hub-footer">
          <span className="eyebrow">THE MUSIC STAYS WITH YOU</span>
          <div className="hub-current-track">
            <Artwork song={song} text={false} />
            <span>
              <strong>{song.title}</strong>
              <small>
                {song.artist} · {formatTime(time)}
              </small>
            </span>
            <Equalizer playing={playing} />
          </div>
          <button className="hub-return" onClick={onClose}>
            Back to your music
            <Icon name="arrow" size={17} />
          </button>
        </footer>
      </section>
    </div>
  )
}
