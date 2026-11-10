import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { beyondTheNightLyrics } from "../fixtures/beyondTheNightLyrics"
import { LyricsPreview } from "./LyricsPreview"

describe("LyricsPreview", () => {
  it("marks the lyric matching the playback clock as current", () => {
    render(
      <LyricsPreview
        document={beyondTheNightLyrics}
        currentTimeSeconds={17}
        onOpen={vi.fn()}
      />,
    )

    expect(screen.getByText("名前のない風を追いかけた。")).toHaveAttribute(
      "aria-current",
      "true",
    )
    expect(screen.getAllByText("Live")).toHaveLength(1)
  })
})
