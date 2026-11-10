import { describe, expect, it } from "vitest"

import { initialPlaybackState, playbackReducer } from "./playback"

describe("playbackReducer", () => {
  it("loads and starts a selected fixture track", () => {
    const state = playbackReducer(initialPlaybackState, {
      type: "load",
      input: { trackId: "yoru", durationSeconds: 218 },
      autoPlay: true,
    })

    expect(state).toEqual({
      trackId: "yoru",
      status: "playing",
      currentTime: 0,
      duration: 218,
    })
  })

  it("clamps seeking and marks the fixture as ended", () => {
    const loaded = playbackReducer(initialPlaybackState, {
      type: "load",
      input: { trackId: "yoru", durationSeconds: 218 },
      autoPlay: true,
    })

    expect(playbackReducer(loaded, { type: "seek", time: 500 })).toMatchObject({
      currentTime: 218,
      status: "ended",
    })
  })
})
