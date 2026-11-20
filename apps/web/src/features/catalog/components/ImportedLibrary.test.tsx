import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ImportedLibrary } from "./ImportedLibrary"

describe("ImportedLibrary", () => {
  it("presents a playable YouTube item as a standard music card", () => {
    const onPlay = vi.fn()
    render(
      <ImportedLibrary
        onPlay={onPlay}
        items={[{
          libraryItemId: "library-1",
          trackId: "track-1",
          title: "夜の向こう",
          artist: "Uta",
          album: null,
          durationSeconds: 180,
          preferredSourceId: "youtube-1",
          lyrics: {
            id: "lyrics-1",
            version: 1,
            language: "ja",
            timingType: "line",
            segments: [],
            sourceProvider: "lrclib",
            sourceRecordId: "42",
            attribution: "Lyrics supplied by LRCLIB",
            rightsCapabilities: { status: "unknown" },
          },
          sources: [
            {
              id: "local-1",
              kind: "local_file",
              availability: "local_file_required",
              externalId: null,
              normalizedUrl: null,
              durationSeconds: 180,
              capabilities: {},
            },
            {
              id: "youtube-1",
              kind: "youtube",
              availability: "available",
              externalId: "M7lc1UVf-VE",
              normalizedUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
              durationSeconds: 181,
              capabilities: {},
            },
          ],
        }]}
      />,
    )

    expect(screen.getByText("夜の向こう")).toBeVisible()
    expect(screen.getByText("Uta · YouTube · 3:00")).toBeVisible()
    expect(screen.getByText("Lyrics ready")).toBeVisible()
    expect(screen.getByAltText("夜の向こう YouTube thumbnail")).toHaveAttribute(
      "src",
      "https://i.ytimg.com/vi/M7lc1UVf-VE/hqdefault.jpg",
    )

    fireEvent.click(
      screen.getByRole("button", { name: /夜の向こう.*YouTube.*3:00/i }),
    )
    expect(onPlay).toHaveBeenCalledWith(
      expect.objectContaining({ trackId: "track-1" }),
      expect.objectContaining({ id: "youtube-1", externalId: "M7lc1UVf-VE" }),
    )
  })

  it("uses a stable fallback cover for a local file that needs reselection", () => {
    render(
      <ImportedLibrary
        items={[{
          libraryItemId: "library-2",
          trackId: "track-2",
          title: "First Light",
          artist: "Uta",
          album: "Home Recordings",
          durationSeconds: 125,
          preferredSourceId: "local-2",
          lyrics: null,
          sources: [{
            id: "local-2",
            kind: "local_file",
            availability: "local_file_required",
            externalId: null,
            normalizedUrl: null,
            durationSeconds: 125,
            capabilities: {},
          }],
        }]}
      />,
    )

    expect(screen.getByText("FI")).toBeVisible()
    expect(
      screen.getByText("Uta · Home Recordings · Local file · 2:05"),
    ).toBeVisible()
    expect(screen.getByText("Local file required")).toBeVisible()
    expect(screen.getByRole("button", { name: /First Light/ })).toBeDisabled()
  })
})
