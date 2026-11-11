import { describe, expect, it } from "vitest"

import { beyondTheNightLyrics } from "../fixtures/beyondTheNightLyrics"
import { findActiveSegmentIndex } from "./findActiveSegmentIndex"

describe("findActiveSegmentIndex", () => {
  it.each([
    [-1, -1],
    [0, 0],
    [15.99, 0],
    [16, 1],
    [201.99, 10],
    [202, 11],
    [217.99, 11],
    [218, -1],
    [999, -1],
  ])("maps %s seconds to segment %s", (time, expectedIndex) => {
    expect(findActiveSegmentIndex(beyondTheNightLyrics, time)).toBe(
      expectedIndex,
    )
  })

  it("returns no active segment inside a timing gap", () => {
    const documentWithGap = {
      ...beyondTheNightLyrics,
      segments: [
        { ...beyondTheNightLyrics.segments[0], endSeconds: 10 },
        { ...beyondTheNightLyrics.segments[1], startSeconds: 16 },
      ],
    }

    expect(findActiveSegmentIndex(documentWithGap, 12)).toBe(-1)
  })
})
