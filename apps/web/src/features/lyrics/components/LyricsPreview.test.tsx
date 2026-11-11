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

  it("keeps nearby lyrics stable without marking a line active in a gap", () => {
    const documentWithGap = {
      ...beyondTheNightLyrics,
      segments: [
        { ...beyondTheNightLyrics.segments[0], endSeconds: 10 },
        { ...beyondTheNightLyrics.segments[1], startSeconds: 16 },
      ],
    }
    const { container } = render(
      <LyricsPreview
        document={documentWithGap}
        currentTimeSeconds={12}
        onOpen={vi.fn()}
      />,
    )

    expect(screen.getByText("名前のない風を追いかけた。")).toBeVisible()
    expect(container.querySelector("[aria-current]")).toBeNull()
    expect(screen.queryByText("Live")).not.toBeInTheDocument()
  })
})
