import { describe, expect, it } from "vitest"

import { beyondTheNightLyrics } from "../../lyrics"
import { beyondTheNightExplanations } from "./beyondTheNightExplanations"

describe("beyondTheNightExplanations", () => {
  it("provides one versioned explanation for every lyric segment", () => {
    expect(
      beyondTheNightExplanations
        .filter((item) => item.selectionKind === "expression")
        .map((item) => item.segmentId),
    ).toEqual(
      beyondTheNightLyrics.segments.map((segment) => segment.id),
    )
    expect(beyondTheNightExplanations.every((item) => item.version === 1)).toBe(
      true,
    )
    expect(
      beyondTheNightExplanations.some(
        (item) => item.selectionKind === "kanji" && item.selectedText === "灯",
      ),
    ).toBe(true)
  })
})
