import { describe, expect, it } from "vitest"

import { initialPlaybackState, playbackReducer } from "./playback"

describe("playbackReducer", () => {
  it("loads a selected media source before browser playback begins", () => {
    const loading = playbackReducer(initialPlaybackState, {
      type: "load",
      input: {
        trackId: "yoru",
        src: "/media/beyond-the-night-fixture.mp3",
        expectedDurationSeconds: 218,
      },
    })

    expect(loading).toEqual({
      trackId: "yoru",
      status: "loading",
      currentTime: 0,
      duration: 218,
    })
    expect(playbackReducer(loading, { type: "play" }).status).toBe("playing")
  })

  it("accepts authoritative duration and time from media events", () => {
    const loaded = playbackReducer(initialPlaybackState, {
      type: "load",
      input: {
        trackId: "yoru",
        src: "/media/beyond-the-night-fixture.mp3",
        expectedDurationSeconds: 218,
      },
    })
    const updated = playbackReducer(loaded, {
      type: "timeupdate",
      currentTime: 221,
      duration: 218.07,
    })

    expect(updated).toMatchObject({
      currentTime: 218.07,
      duration: 218.07,
    })
  })

  it("records ended and recoverable media-error states", () => {
    const playing = {
      trackId: "yoru",
      status: "playing" as const,
      currentTime: 120,
      duration: 218.07,
    }

    expect(playbackReducer(playing, { type: "ended" })).toMatchObject({
      currentTime: 218.07,
      status: "ended",
    })
    expect(playbackReducer(playing, { type: "error" }).status).toBe("error")
  })
})
