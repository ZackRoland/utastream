import { useRef, type MouseEvent, type TouchEvent } from "react"

type SwipeOptions = {
  enabled: boolean
  direction: 1 | -1
  onSwipe: () => void
}
type SwipeStart = {
  x: number
  y: number
  at: number
  scrollTop: number
  cancelled: boolean
}
const horizontalControls = [
  "input",
  "select",
  "textarea",
  "[contenteditable=true]",
  "[role=slider]",
  "[aria-roledescription=carousel]",
  "[data-horizontal-interactive]",
  ".album-grid",
  ".filter-row",
  ".persistent-player",
  ".lyrics-overlay",
  ".embedded-lyrics",
  ".sentence-card",
].join(",")

export default function useContentSwipe({
  enabled,
  direction,
  onSwipe,
}: SwipeOptions) {
  const start = useRef<SwipeStart | null>(null)
  const suppressClickUntil = useRef(0)
  return {
    onTouchStart: (event: TouchEvent<HTMLElement>) => {
      start.current = null
      if (!enabled || event.touches.length !== 1) return
      const touch = event.touches[0]
      const bounds = event.currentTarget.getBoundingClientRect()
      // Never claim an OS/browser edge gesture, and never alter native touch scrolling.
      if (
        touch.clientX < Math.max(44, bounds.left + 16) ||
        touch.clientX > window.innerWidth - 20
      )
        return
      const target = event.target as HTMLElement
      if (target.closest(horizontalControls)) return
      for (
        let node: HTMLElement | null = target;
        node && node !== event.currentTarget;
        node = node.parentElement
      ) {
        const overflow = getComputedStyle(node).overflowX
        if (
          ["auto", "scroll"].includes(overflow) &&
          node.scrollWidth > node.clientWidth + 2
        )
          return
      }
      start.current = {
        x: touch.clientX,
        y: touch.clientY,
        at: performance.now(),
        scrollTop: event.currentTarget.scrollTop,
        cancelled: false,
      }
    },
    onTouchMove: (event: TouchEvent<HTMLElement>) => {
      const initial = start.current
      if (!initial) return
      if (event.touches.length !== 1) {
        initial.cancelled = true
        return
      }
      const dx = (event.touches[0].clientX - initial.x) * direction
      const dy = Math.abs(event.touches[0].clientY - initial.y)
      if (
        (dy > 18 && dy > Math.abs(dx) * 0.65) ||
        dx < -20 ||
        Math.abs(event.currentTarget.scrollTop - initial.scrollTop) > 12
      )
        initial.cancelled = true
    },
    onTouchEnd: (event: TouchEvent<HTMLElement>) => {
      const initial = start.current
      start.current = null
      if (
        !enabled ||
        !initial ||
        initial.cancelled ||
        event.changedTouches.length !== 1
      )
        return
      const dx = (event.changedTouches[0].clientX - initial.x) * direction
      const dy = Math.abs(event.changedTouches[0].clientY - initial.y)
      const elapsed = performance.now() - initial.at
      if (
        dx >= 104 &&
        dy <= 48 &&
        dx >= dy * 2.2 &&
        elapsed >= 65 &&
        elapsed <= 650 &&
        dx / elapsed >= 0.35
      ) {
        suppressClickUntil.current = performance.now() + 500
        onSwipe()
      }
    },
    onTouchCancel: () => {
      start.current = null
    },
    onClickCapture: (event: MouseEvent<HTMLElement>) => {
      if (performance.now() < suppressClickUntil.current) {
        event.preventDefault()
        event.stopPropagation()
      }
    },
  }
}
