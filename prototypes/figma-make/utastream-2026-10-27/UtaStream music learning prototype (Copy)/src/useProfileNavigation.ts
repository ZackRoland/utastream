import { useCallback, useEffect, useRef, useState } from "react"

export type SecondaryPage = "Review" | "Profile" | "History"
type Layer = {
  page: SecondaryPage | "hub"
  section: string | null
}
const historyKey = "utastreamProfileLayer"
function readLayer(): Layer | null {
  const value = window.history.state?.[historyKey]
  if (!value || !["hub", "Review", "Profile", "History"].includes(value.page))
    return null
  return {
    page: value.page,
    section: typeof value.section === "string" ? value.section : null,
  }
}

export default function useProfileNavigation() {
  const [layer, setLayer] = useState<Layer | null>(readLayer)
  const opener = useRef<HTMLElement | null>(null)
  const closing = useRef(false)

  useEffect(() => {
    const pop = () => {
      closing.current = false
      setLayer(readLayer())
    }
    window.addEventListener("popstate", pop)
    return () => window.removeEventListener("popstate", pop)
  }, [])

  useEffect(() => {
    if (layer || !opener.current) return
    const frame = requestAnimationFrame(() => {
      const target = opener.current?.isConnected
        ? opener.current
        : document.querySelector<HTMLElement>('[aria-label="Open Profile hub"]')
      target?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [layer])

  const show = useCallback(
    (page: Layer["page"], section: string | null = null) => {
      const existing = readLayer()
      if (!existing) {
        const active = document.activeElement as HTMLElement | null
        opener.current =
          active && active !== document.body
            ? active
            : document.querySelector<HTMLElement>(
                '[aria-label="Open Profile hub"]',
              )
      }
      const next = { page, section }
      const state = { ...window.history.state, [historyKey]: next }
      // This secondary layer occupies one history entry; browser Back returns to music.
      if (existing) window.history.replaceState(state, "")
      else window.history.pushState(state, "")
      setLayer(next)
    },
    [],
  )
  const openHub = useCallback(() => show("hub"), [show])
  const select = useCallback(
    (page: SecondaryPage, section: string | null = null) => show(page, section),
    [show],
  )
  const close = useCallback(() => {
    if (closing.current) return
    if (readLayer()) {
      closing.current = true
      window.history.back()
    } else setLayer(null)
  }, [])
  return { layer, openHub, select, close }
}
