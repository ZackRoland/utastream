import { describe, expect, it } from "vitest"

import { beyondTheNightLyrics } from "../fixtures/beyondTheNightLyrics"
import { findActiveSegmentIndex } from "./findActiveSegmentIndex"

describe("findActiveSegmentIndex", () => {
  it.each([
    [-1, 0],
    [0, 0],
    [15.99, 0],
    [16, 1],
    [201.99, 10],
    [202, 11],
    [999, 11],
  ])("maps %s seconds to segment %s", (time, expectedIndex) => {
    expect(findActiveSegmentIndex(beyondTheNightLyrics, time)).toBe(
      expectedIndex,
    )
  })
})
