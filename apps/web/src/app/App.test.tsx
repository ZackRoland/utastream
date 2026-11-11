import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { App } from "./App"

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

    act(() => vi.advanceTimersByTime(1_000))
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
    act(() => vi.advanceTimersByTime(1_000))
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
    act(() => vi.advanceTimersByTime(3_000))
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

  it("keeps playback available when a selected fixture has no lyrics", () => {
    render(<App />)
    fireEvent.click(
      screen.getByRole("button", {
        name: /Room for Blue album artwork/,
      }),
    )

    expect(
      screen.getByRole("heading", {
        name: "Lyrics aren’t available for this fixture.",
      }),
    ).toBeVisible()
    act(() => vi.advanceTimersByTime(2_000))
    expect(screen.getByRole("slider", { name: "Playback position" })).toHaveValue(
      "2",
    )
    expect(screen.queryByRole("button", { name: "Open lyrics" })).toBeNull()
    expect(screen.getByRole("button", { name: "Pause" })).toBeVisible()
  })
})
