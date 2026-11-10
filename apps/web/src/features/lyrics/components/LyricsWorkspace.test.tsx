import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { beyondTheNightLyrics } from "../fixtures/beyondTheNightLyrics"
import { LyricsWorkspace } from "./LyricsWorkspace"

const track = {
  japaneseTitle: "夜の向こう",
  englishTitle: "Beyond the Night",
  artist: "haruno",
  artworkSrc: "/images/beyond-the-night.jpg",
  artworkAlt: "Beyond the Night album artwork",
}

describe("LyricsWorkspace", () => {
  it("shows the complete document and preserves external playback commands", () => {
    const onClose = vi.fn()
    const onTogglePlayback = vi.fn()
    const onSelectSegment = vi.fn()

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
        selectedSegmentId={null}
        onSelectSegment={onSelectSegment}
      />,
    )

    expect(
      screen
        .getByText("名前のない風を追いかけた。")
        .closest("[aria-current]"),
    ).toHaveAttribute("aria-current", "true")
    expect(screen.getAllByText("May this song find its way to you.")).toHaveLength(1)

    fireEvent.click(
      screen.getByRole("button", { name: /名前のない風を追いかけた。 Open explanation/ }),
    )
    fireEvent.click(screen.getByRole("button", { name: "Pause" }))
    fireEvent.click(
      screen.getByRole("button", {
        name: "Close lyrics and return to collection",
      }),
    )

    expect(onTogglePlayback).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
    expect(onSelectSegment).toHaveBeenCalledWith("yoru-2")
  })
})
