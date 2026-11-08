import { describe, expect, it } from "vitest"

import { seededTracks } from "./seededTracks"

describe("seededTracks", () => {
  it("has stable unique ids and one lyric-ready walking-skeleton track", () => {
    const ids = seededTracks.map((track) => track.id)

    expect(new Set(ids).size).toBe(ids.length)
    expect(seededTracks.filter((track) => track.lyricStatus === "ready")).toHaveLength(1)
  })
})
