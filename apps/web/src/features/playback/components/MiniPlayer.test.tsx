import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { MiniPlayer } from "./MiniPlayer"

const track = {
  title: "夜の向こう",
  englishTitle: "Beyond the Night",
  artist: "haruno",
  artworkSrc: "/images/beyond-the-night.jpg",
  artworkAlt: "Beyond the Night album artwork",
}

describe("MiniPlayer", () => {
  it("exposes transport commands without owning their behavior", () => {
    const onToggle = vi.fn()
    const onSeek = vi.fn()

    render(
      <MiniPlayer
        track={track}
        playback={{
          trackId: "yoru",
          status: "playing",
          currentTime: 68,
          duration: 218,
        }}
        onToggle={onToggle}
        onSeek={onSeek}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "Pause" }))
    fireEvent.change(screen.getByRole("slider", { name: "Playback position" }), {
      target: { value: "90" },
    })

    expect(onToggle).toHaveBeenCalledOnce()
    expect(onSeek).toHaveBeenCalledWith(90)
  })

  it("exposes an ended state independently from the play command", () => {
    render(
      <MiniPlayer
        track={track}
        playback={{
          trackId: "yoru",
          status: "ended",
          currentTime: 218,
          duration: 218,
        }}
        onToggle={vi.fn()}
        onSeek={vi.fn()}
      />,
    )

    expect(screen.getByRole("status")).toHaveTextContent("Playback ended")
    expect(screen.getByRole("button", { name: "Play" })).toBeVisible()
  })
})
