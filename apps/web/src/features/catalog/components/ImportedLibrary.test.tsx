import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ImportedLibrary } from "./ImportedLibrary"

describe("ImportedLibrary", () => {
  it("shows one canonical item with multiple source states", () => {
    render(
      <ImportedLibrary
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

    expect(screen.getByRole("heading", { name: "夜の向こう" })).toBeVisible()
    expect(screen.getByText("Local file required")).toBeVisible()
    expect(screen.getByText("Version 1")).toBeVisible()
    expect(screen.getByText("2")).toBeVisible()
  })
})
