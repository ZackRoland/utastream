import { act, render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { useAudioPlayback } from "./useAudioPlayback"

const input = {
  trackId: "yoru",
  src: "/media/beyond-the-night-fixture.mp3",
  expectedDurationSeconds: 218,
}

type PlaybackController = ReturnType<typeof useAudioPlayback>

function renderPlayback() {
  let controller: PlaybackController | null = null

  function Harness() {
    controller = useAudioPlayback()
    return <audio ref={controller.mediaRef} />
  }

  const view = render(<Harness />)
  const audio = view.container.querySelector("audio")
  if (!audio || !controller) throw new Error("Playback harness did not mount")

  return {
    audio,
    controller: () => controller as PlaybackController,
  }
}

describe("useAudioPlayback", () => {
  it("uses browser media events as the playback clock", async () => {
    const playback = renderPlayback()

    act(() => playback.controller().load(input, { autoPlay: true }))
    await act(async () => Promise.resolve())

    expect(playback.audio.src).toContain("/media/beyond-the-night-fixture.mp3")
    expect(playback.controller().state).toMatchObject({
      duration: 218.07,
      status: "playing",
      trackId: "yoru",
    })

    act(() => {
      playback.audio.currentTime = 17
      playback.audio.dispatchEvent(new Event("timeupdate"))
    })
    expect(playback.controller().state.currentTime).toBe(17)
  })

  it("seeks the media element and follows its ended event", async () => {
    const playback = renderPlayback()

    act(() => playback.controller().load(input, { autoPlay: true }))
    await act(async () => Promise.resolve())
    act(() => playback.controller().seek(86))

    expect(playback.audio.currentTime).toBe(86)
    expect(playback.controller().state.currentTime).toBe(86)

    act(() => playback.audio.dispatchEvent(new Event("ended")))
    expect(playback.controller().state).toMatchObject({
      currentTime: 218.07,
      status: "ended",
    })
  })
})
