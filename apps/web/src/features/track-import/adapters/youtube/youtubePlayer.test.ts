import { afterEach, describe, expect, it, vi } from "vitest"

import { mountYouTubePlayer } from "./youtubePlayer"

describe("mountYouTubePlayer", () => {
  afterEach(() => {
    delete window.YT
  })

  it("constructs an unobscured, controlled official player with origin", async () => {
    const destroy = vi.fn()
    const getDuration = vi.fn(() => 218)
    const Player = vi.fn(function (_element, options) {
      options.events.onReady({ target: { destroy, getDuration } })
      return { destroy, getDuration }
    })
    window.YT = { Player: Player as never }
    const onReady = vi.fn()

    const handle = await mountYouTubePlayer(
      document.createElement("div"),
      "M7lc1UVf-VE",
      { onReady, onError: vi.fn() },
    )

    expect(Player).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        videoId: "M7lc1UVf-VE",
        playerVars: {
          autoplay: 0,
          controls: 1,
          origin: window.location.origin,
          playsinline: 1,
        },
      }),
    )
    expect(onReady).toHaveBeenCalledWith(218)
    expect(JSON.stringify(Player.mock.calls[0][1])).not.toContain(
      "modestbranding",
    )

    handle.destroy()
    expect(destroy).toHaveBeenCalledOnce()
  })
})
