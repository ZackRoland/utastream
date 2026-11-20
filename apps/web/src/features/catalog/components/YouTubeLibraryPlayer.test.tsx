import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import type { LibraryTrack } from "../api/libraryApi"
import { YouTubeLibraryPlayer } from "./YouTubeLibraryPlayer"

const track = {
  libraryItemId: "library-1",
  trackId: "track-1",
  title: "家族の結末",
  artist: "Österreich",
  album: null,
  durationSeconds: 218,
  preferredSourceId: "youtube-1",
  lyrics: {
    id: "lyrics-1",
    bindingId: "binding-1",
    playbackSourceId: "youtube-1",
    version: 1,
    language: "ja",
    timingType: "line",
    segments: [{ startSeconds: 1, endSeconds: 4, text: "家族の記憶" }],
    sourceProvider: "lrclib",
    sourceRecordId: "42",
    attribution: "Lyrics supplied by LRCLIB",
    rightsCapabilities: {},
    timingOffsetMs: 0,
  },
  sources: [{
    id: "youtube-1",
    kind: "youtube" as const,
    availability: "available" as const,
    externalId: "RpSb3zemrrA",
    normalizedUrl: "https://www.youtube.com/watch?v=RpSb3zemrrA",
    durationSeconds: 218,
    capabilities: {},
  }],
} satisfies LibraryTrack

describe("YouTubeLibraryPlayer", () => {
  it("reconstructs and destroys the official visible player", async () => {
    const destroy = vi.fn()
    const play = vi.fn()
    const pause = vi.fn()
    const seek = vi.fn()
    const mountPlayer = vi.fn(async (element, videoId, callbacks) => {
      const iframe = document.createElement("iframe")
      iframe.title = "Official YouTube player"
      element.append(iframe)
      callbacks.onReady(218)
      return {
        destroy,
        getCurrentTime: () => 1,
        getDuration: () => 218,
        play,
        pause,
        seek,
      }
    })

    const view = render(
      <YouTubeLibraryPlayer
        track={track}
        source={track.sources[0]}
        onClose={vi.fn()}
        mountPlayer={mountPlayer}
      />,
    )

    await waitFor(() => expect(mountPlayer).toHaveBeenCalledOnce())
    expect(mountPlayer.mock.calls[0][1]).toBe("RpSb3zemrrA")
    expect(screen.getByTitle("Official YouTube player")).toBeVisible()
    expect(screen.getByText(/open synchronized lyrics/)).toBeVisible()
    expect(screen.getByRole("heading", { name: "Lyrics" })).toBeVisible()

    fireEvent.click(screen.getByRole("button", { name: "Open lyrics" }))
    const lyrics = screen.getByRole("dialog", {
      name: "Synchronized lyrics for 家族の結末",
    })
    expect(lyrics).toBeVisible()
    expect(within(lyrics).getByText("家族の記憶")).toBeVisible()
    fireEvent.click(screen.getByRole("button", { name: "Play" }))
    expect(play).toHaveBeenCalledOnce()
    fireEvent.change(screen.getByRole("slider", { name: "Playback position" }), {
      target: { value: "3" },
    })
    expect(seek).toHaveBeenCalledWith(3)

    view.unmount()
    expect(destroy).toHaveBeenCalledOnce()
  })
})
