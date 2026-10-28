import { useEffect, useRef, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { Icon, IconButton } from "./components"

type Props = {
  title: string
  section?: string | null
  inactive: boolean
  onHub: () => void
  onClose: () => void
  children: ReactNode
}

export default function SecondaryScreen({
  title,
  section,
  inactive,
  onHub,
  onClose,
  children,
}: Props) {
  const scroll = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (section)
        scroll.current
          ?.querySelector<HTMLElement>(`#${section}`)
          ?.scrollIntoView({ block: "start", behavior: "instant" })
    })
    return () => cancelAnimationFrame(frame)
  }, [section])
  return createPortal(
    <section
      className="secondary-screen"
      role="region"
      aria-label={title}
      inert={inactive}
      aria-hidden={inactive}
    >
      <header className="secondary-header">
        <button className="secondary-back" onClick={onHub}>
          <Icon name="back" size={19} />
          Profile hub
        </button>
        <span>{title}</span>
        <IconButton name="close" label="Return to music" onClick={onClose} />
      </header>
      <div className="secondary-scroll" ref={scroll}>
        {children}
      </div>
    </section>,
    document.body,
  )
}
