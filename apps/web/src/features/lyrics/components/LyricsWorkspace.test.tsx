import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { beyondTheNightExplanations } from "../../learning"
import { beyondTheNightLyrics } from "../fixtures/beyondTheNightLyrics"
import { LyricsWorkspace } from "./LyricsWorkspace"

const track = {
  japaneseTitle: "夜の向こう",
  englishTitle: "Beyond the Night",
  artist: "haruno",
  artworkSrc: "/images/beyond-the-night.jpg",
  artworkAlt: "Beyond the Night album artwork",
}

const annotations = beyondTheNightExplanations.map((explanation) => ({
  explanationId: explanation.id,
  segmentId: explanation.segmentId,
  selectedText: explanation.selectedText,
  selectionKind: explanation.selectionKind,
}))

describe("LyricsWorkspace", () => {
  it("shows the complete document and preserves external playback commands", () => {
    const onClose = vi.fn()
    const onTogglePlayback = vi.fn()
    const onSelectExplanation = vi.fn()

    render(
      <LyricsWorkspace
        document={beyondTheNightLyrics}
        track={track}
        playback={{
          trackId: "yoru",
          status: "playing",
          currentTime: 17,
          duration: 218,
        }}
        onClose={onClose}
        onTogglePlayback={onTogglePlayback}
        onSeek={vi.fn()}
        annotations={annotations}
        selectedExplanationId={null}
        onSelectExplanation={onSelectExplanation}
      />,
    )

    expect(
      screen
        .getByText("名前のない風を追いかけた。")
        .closest("[aria-current]"),
    ).toHaveAttribute("aria-current", "true")
    expect(screen.getAllByText("May this song find its way to you.")).toHaveLength(1)

    const currentLine = screen
      .getByText("名前のない風を追いかけた。")
      .closest("[aria-current]")
    fireEvent.click(screen.getByRole("button", { name: "Translations on" }))

    expect(screen.queryByText("I chased a wind with no name.")).not.toBeInTheDocument()
    expect(currentLine).toHaveAttribute("aria-current", "true")
    expect(screen.getByRole("button", { name: "Kanji 灯" })).toBeVisible()

    fireEvent.click(screen.getByRole("button", { name: "Expression 追いかけた" }))
    fireEvent.click(screen.getByRole("button", { name: "Pause" }))
    fireEvent.click(
      screen.getByRole("button", {
        name: "Close lyrics and return to collection",
      }),
    )

    expect(onTogglePlayback).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
    expect(onSelectExplanation).toHaveBeenCalledWith("explanation-yoru-2")
  })

  it("leaves Escape to a nested explanation when one is selected", () => {
    const onClose = vi.fn()
    render(
      <LyricsWorkspace
        document={beyondTheNightLyrics}
        track={track}
        playback={{
          trackId: "yoru",
          status: "playing",
          currentTime: 1,
          duration: 218,
        }}
        onClose={onClose}
        onTogglePlayback={vi.fn()}
        onSeek={vi.fn()}
        annotations={annotations}
        selectedExplanationId="explanation-yoru-1"
        onSelectExplanation={vi.fn()}
      />,
    )

    fireEvent.keyDown(document, { key: "Escape" })
    expect(onClose).not.toHaveBeenCalled()
  })

  it("distinguishes ended playback from a paused lyric session", () => {
    render(
      <LyricsWorkspace
        document={beyondTheNightLyrics}
        track={track}
        playback={{
          trackId: "yoru",
          status: "ended",
          currentTime: 218,
          duration: 218,
        }}
        onClose={vi.fn()}
        onTogglePlayback={vi.fn()}
        onSeek={vi.fn()}
        annotations={annotations}
        selectedExplanationId={null}
        onSelectExplanation={vi.fn()}
      />,
    )

    expect(screen.getByRole("status")).toHaveTextContent("Lyrics ended")
  })
})
