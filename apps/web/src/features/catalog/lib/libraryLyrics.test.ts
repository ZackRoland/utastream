import { describe, expect, it } from "vitest"

import type { LibraryTrack } from "../api/libraryApi"
import { toLyricDocument } from "./libraryLyrics"

describe("toLyricDocument", () => {
  it("normalizes persisted provider segments for the shared lyric workspace", () => {
    const track = {
      album: null,
      artist: "Artist",
      libraryItemId: "library-1",
      trackId: "track-1",
      title: "Song",
      durationSeconds: 12,
      preferredSourceId: null,
      sources: [],
      lyrics: {
        attribution: "Lyrics supplied by LRCLIB",
        id: "lyrics-1",
        language: "ja",
        rightsCapabilities: {},
        sourceProvider: "lrclib",
        sourceRecordId: "42",
        timingType: "line",
        version: 1,
        segments: [
          { startSeconds: 1, endSeconds: 4, text: "最初" },
          { startSeconds: 4, endSeconds: null, text: "最後" },
        ],
      },
    } satisfies LibraryTrack

    expect(toLyricDocument(track)?.segments).toEqual([
      {
        id: "lyrics-1:0",
        startSeconds: 1,
        endSeconds: 4,
        parts: [{ text: "最初" }],
        translation: "",
      },
      {
        id: "lyrics-1:1",
        startSeconds: 4,
        endSeconds: 12,
        parts: [{ text: "最後" }],
        translation: "",
      },
    ])
  })
})
