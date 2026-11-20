import type { ReactNode } from "react"

import { Icon } from "../../../shared/ui/Icon"
import styles from "./MusicCard.module.css"

type Props = {
  artwork: ReactNode
  title: string
  details: string
  status: ReactNode
  selected: boolean
  disabled?: boolean
  titleLanguage?: string
  onSelect: () => void
}

export function MusicCard({
  artwork,
  title,
  details,
  status,
  selected,
  disabled = false,
  titleLanguage,
  onSelect,
}: Props) {
  return (
    <button
      className={styles.card}
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
    >
      <span className={styles.artworkWrap}>
        {artwork}
        {!disabled && (
          <span className={styles.play} aria-hidden="true">
            <Icon name="play" size={20} />
          </span>
        )}
      </span>
      <strong className={styles.title} lang={titleLanguage}>
        {title}
      </strong>
      <span className={styles.details}>{details}</span>
      <span className={styles.status}>{status}</span>
    </button>
  )
}
