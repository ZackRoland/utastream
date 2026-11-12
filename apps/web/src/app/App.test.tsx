import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { App } from "./App"

function setMediaTime(seconds: number) {
  const media = document.querySelector("audio")
  if (!media) throw new Error("Expected the persistent audio element")

  media.currentTime = seconds
  fireEvent.timeUpdate(media)
}

describe("App fixture walkthrough", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("completes the expression and kanji journey without replacing playback", () => {
    render(<App />)

    fireEvent.click(
      screen.getByRole("button", {
        name: /Beyond the Night album artwork/,
      }),
    )
    expect(screen.getByRole("button", { name: "Pause" })).toBeVisible()

    setMediaTime(1)
    fireEvent.click(screen.getByRole("button", { name: "Open lyrics" }))

    const playbackPosition = screen.getByRole("slider", {
      name: "Playback position",
    })
    expect(Number((playbackPosition as HTMLInputElement).value)).toBeGreaterThanOrEqual(1)

    expect(screen.getByText("Lights come on in the city at night.")).toBeVisible()
    fireEvent.click(screen.getByRole("button", { name: "Translations on" }))
    expect(screen.queryByText("Lights come on in the city at night.")).toBeNull()
    const lyricsWorkspace = screen.getByRole("dialog", {
      name: "Synchronized lyrics for 夜の向こう",
    })
    expect(within(lyricsWorkspace).getByText("夜の街に、灯りがともる。")).toBeVisible()

    const expressionTrigger = screen.getByRole("button", {
      name: "Expression 灯りがともる",
    })
    fireEvent.click(expressionTrigger)
    setMediaTime(2)
    fireEvent.click(screen.getByRole("button", { name: "Save expression" }))
    expect(screen.getByText("Saved with its song and lyric.")).toBeVisible()
    fireEvent.click(
      screen.getByRole("button", { name: "Close expression explanation" }),
    )
    act(() => vi.advanceTimersByTime(20))
    expect(expressionTrigger).toHaveFocus()

    const kanjiTrigger = screen.getByRole("button", { name: "Kanji 灯" })
    fireEvent.click(kanjiTrigger)
    expect(screen.getByRole("heading", { name: "灯" })).toBeVisible()
    fireEvent.click(screen.getByRole("button", { name: "Save kanji" }))
    expect(screen.getByRole("button", { name: "Kanji saved" })).toHaveAttribute(
      "aria-disabled",
      "true",
    )
    fireEvent.keyDown(document, { key: "Escape" })
    act(() => vi.advanceTimersByTime(20))

    expect(lyricsWorkspace).toBeVisible()
    expect(kanjiTrigger).toHaveFocus()

    fireEvent.click(expressionTrigger)
    expect(
      screen.getByRole("button", { name: "Expression saved" }),
    ).toHaveAttribute("aria-disabled", "true")
    fireEvent.click(
      screen.getByRole("button", { name: "Close expression explanation" }),
    )
    act(() => vi.advanceTimersByTime(20))

    fireEvent.click(kanjiTrigger)
    expect(screen.getByRole("button", { name: "Kanji saved" })).toHaveAttribute(
      "aria-disabled",
      "true",
    )
    fireEvent.keyDown(document, { key: "Escape" })
    act(() => vi.advanceTimersByTime(20))

    expect(screen.getByRole("button", { name: "Pause" })).toBeVisible()
    expect(Number((playbackPosition as HTMLInputElement).value)).toBeGreaterThanOrEqual(2)

    fireEvent.click(
      screen.getByRole("button", {
        name: "Close lyrics and return to collection",
      }),
    )
    act(() => vi.advanceTimersByTime(20))
    expect(screen.getByRole("button", { name: "Open lyrics" })).toHaveFocus()
    expect(screen.getByRole("button", { name: "Pause" })).toBeVisible()
  })

  it("keeps a paused track paused while an explanation opens and closes", () => {
    render(<App />)
    fireEvent.click(
      screen.getByRole("button", {
        name: /Beyond the Night album artwork/,
      }),
    )
    setMediaTime(3)
    fireEvent.click(screen.getByRole("button", { name: "Pause" }))
    fireEvent.click(screen.getByRole("button", { name: "Open lyrics" }))
    fireEvent.click(
      screen.getByRole("button", { name: "Expression 灯りがともる" }),
    )

    act(() => vi.advanceTimersByTime(2_000))
    fireEvent.click(
      screen.getByRole("button", { name: "Close expression explanation" }),
    )
    act(() => vi.advanceTimersByTime(20))

    expect(screen.getByRole("button", { name: "Play" })).toBeVisible()
    expect(screen.getByRole("slider", { name: "Playback position" })).toHaveValue(
      "3",
    )
  })

  it("does not replace active playback with a prototype card lacking media", () => {
    render(<App />)
    fireEvent.click(
      screen.getByRole("button", {
        name: /Beyond the Night album artwork/,
      }),
    )
    setMediaTime(2)

    const unavailableTrack = screen.getByRole("button", {
      name: /Room for Blue album artwork/,
    })
    expect(unavailableTrack).toBeDisabled()
    fireEvent.click(unavailableTrack)

    expect(screen.getByRole("slider", { name: "Playback position" })).toHaveValue(
      "2",
    )
    expect(screen.getByRole("button", { name: "Pause" })).toBeVisible()
    expect(screen.getByRole("button", { name: "Open lyrics" })).toBeVisible()
  })
})
