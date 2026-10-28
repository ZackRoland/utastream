import type { CSSProperties, ReactNode } from "react"
import type { Song, Lyric } from "./data"

const paths: Record<string, ReactNode> = {
  home: (
    <>
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  library: (
    <>
      <rect x="3" y="4" width="4" height="16" rx="1" />
      <rect x="10" y="4" width="4" height="16" rx="1" />
      <path d="m17 4 4 15-3 1-4-15" />
    </>
  ),
  review: (
    <>
      <rect x="4" y="7" width="15" height="14" rx="2" />
      <path d="M8 3h11a2 2 0 0 1 2 2v12M8 13l3 3 5-6" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7h16M4 17h16" />
      <circle cx="9" cy="7" r="3" fill="var(--surface)" />
      <circle cx="15" cy="17" r="3" fill="var(--surface)" />
    </>
  ),
  history: (
    <>
      <path d="M3 10a9 9 0 1 1 2 8M3 4v6h6M12 7v5l3 2" />
    </>
  ),
  accessibility: (
    <>
      <circle cx="12" cy="4" r="2" />
      <path d="m4 9 8 2 8-2M12 11v5m0 0-4 6m4-6 4 6" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4m0 4h.01" />
    </>
  ),
  play: <path d="m9 5 11 7-11 7Z" />,
  pause: (
    <>
      <path d="M8 5v14M16 5v14" strokeWidth="4" />
    </>
  ),
  next: (
    <>
      <path d="m5 5 10 7L5 19Z" />
      <path d="M19 5v14" />
    </>
  ),
  previous: (
    <>
      <path d="m19 5-10 7 10 7Z" />
      <path d="M5 5v14" />
    </>
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
  arrow: (
    <>
      <path d="M4 12h16m-6-6 6 6-6 6" />
    </>
  ),
  back: <path d="m14 5-7 7 7 7" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="m5 12 4 4L19 6" />,
  heart: (
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
  ),
  shuffle: (
    <>
      <path d="M3 5h3l12 14h3m-4-4 4 4-4 3M3 19h3l5-6m3-5 4-3h3m-4-3 4 3-4 3" />
    </>
  ),
  repeat: (
    <>
      <path d="m17 2 4 4-4 4M3 11V8a2 2 0 0 1 2-2h16M7 22l-4-4 4-4m14-1v3a2 2 0 0 1-2 2H3" />
    </>
  ),
  replay: (
    <>
      <path d="M3 10a9 9 0 1 1 2 8M3 4v6h6" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  wave: (
    <>
      <path d="M2 13c4 0 4-7 9-7 3 0 4 2 3 4-1 2-4 1-3 0M2 17c5 0 6-5 10-5 5 0 5 5 10 5M2 21c6 0 6-4 10-4s5 4 10 4" />
    </>
  ),
  focus: (
    <>
      <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M7 10h10M7 14h7" />
    </>
  ),
  live: (
    <>
      <path d="M5 7a8 8 0 0 0 0 10m14-10a8 8 0 0 1 0 10M8 9a4 4 0 0 0 0 6m8-6a4 4 0 0 1 0 6" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </>
  ),
  queue: (
    <>
      <path d="M4 5h16M4 10h16M4 15h8m4 0 5 3-5 3Z" />
    </>
  ),
  volume: (
    <>
      <path d="M4 9h4l5-4v14l-5-4H4ZM17 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  expand: (
    <>
      <path d="M14 3h7v7m0-7-7 7M10 21H3v-7m0 7 7-7" />
    </>
  ),
  lyrics: (
    <>
      <path d="M4 5h16M4 10h12M4 15h16M4 20h9" />
    </>
  ),
  headphones: (
    <>
      <path d="M4 14v-3a8 8 0 0 1 16 0v3" />
      <rect x="3" y="12" width="4" height="8" rx="2" />
      <rect x="17" y="12" width="4" height="8" rx="2" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
    </>
  ),
  moon: <path d="M20 15.5A9 9 0 0 1 8.5 4 9 9 0 1 0 20 15.5Z" />,
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </>
  ),
  bookmark: <path d="M6 3h12v18l-6-4-6 4Z" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5l11-2v13M9 8l11-2" />
      <ellipse cx="6" cy="18" rx="3" ry="2" />
      <ellipse cx="17" cy="16" rx="3" ry="2" />
    </>
  ),
}

export function Icon({
  name,
  size = 22,
  className = "",
}: {
  name: string
  size?: number
  className?: string
}) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={
        ["play", "next", "previous"].includes(name) ? "currentColor" : "none"
      }
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.music}
    </svg>
  )
}

export function IconButton({
  name,
  label,
  onClick,
  className = "",
  active = false,
}: {
  name: string
  label: string
  onClick: () => void
  className?: string
  active?: boolean
}) {
  return (
    <button
      className={`icon-button ${active ? "is-active" : ""} ${className}`}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
    >
      <Icon name={name} />
    </button>
  )
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand">
      <span className="brand-symbol">
        <svg
          width="29"
          height="29"
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 17C9 17 9 6 17 6c5 0 7 5 4 8-2 2-6 0-4-2M3 23c7 0 9-9 15-9 5 0 6 8 11 8M3 28c8 0 10-8 16-8 4 0 6 7 10 7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {!compact && (
        <span>
          uta<span className="brand-light">stream</span>
          <span className="brand-dot">.</span>
        </span>
      )}
    </div>
  )
}

export function Artwork({
  song,
  className = "",
  text = true,
}: {
  song: Song
  className?: string
  text?: boolean
}) {
  return (
    <div
      className={`artwork art-${song.color} ${className}`}
      style={{ "--art-image": `url("${song.image}")` } as CSSProperties}
      role="img"
      aria-label={`${song.english}, original album artwork`}
    >
      <div className="art-photo" />
      <span className="art-loading">
        <Icon name="wave" size={34} />
      </span>
      <div className="art-grain" />
      {text && (
        <>
          <span className="art-top">{song.label}</span>
          <span className="art-japanese">{song.title}</span>
          <span className="art-bottom">
            {song.sub}
            <span>UT—024</span>
          </span>
        </>
      )}
    </div>
  )
}

export function Japanese({
  line,
  furigana,
}: {
  line: Lyric
  furigana: boolean
}) {
  return (
    <span lang="ja" className={`japanese ${furigana ? "with-furigana" : ""}`}>
      {line.parts.map((part, i) =>
        part.reading && furigana ? (
          <ruby key={i}>
            {part.text}
            <rt>{part.reading}</rt>
          </ruby>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </span>
  )
}

export function Equalizer({ playing = true }: { playing?: boolean }) {
  return (
    <span
      className={`equalizer ${playing ? "animating" : ""}`}
      aria-label={playing ? "Playing" : "Paused"}
    >
      <svg
        viewBox="0 0 26 18"
        width="26"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M1 7c5 0 5-5 10-5s6 5 14 5" />
        <path d="M1 12c5 0 5-5 10-5s6 5 14 5" />
        <path d="M1 17c5 0 5-5 10-5s6 5 14 5" />
      </svg>
    </span>
  )
}
