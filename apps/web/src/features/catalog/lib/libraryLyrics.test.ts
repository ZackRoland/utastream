import { describe, expect, it } from "vitest"

import type { LibraryTrack } from "../api/libraryApi"
import { toLyricDocument } from "./libraryLyrics"

const track = {
  album: null,
  artist: "Artist",
  libraryItemId: "library-1",
  trackId: "track-1",
  title: "Song",
  durationSeconds: 120,
  preferredSourceId: null,
  sources: [],
  lyrics: {
    attribution: "Lyrics supplied by LRCLIB",
    bindingId: "binding-1",
    id: "lyrics-1",
    language: "ja",
    rightsCapabilities: {},
    sourceProvider: "lrclib",
    sourceRecordId: "42",
    playbackSourceId: "source-1",
    timingOffsetMs: 0,
    timingType: "line" as const,
    version: 1,
    segments: [
      { startSeconds: 1, endSeconds: 4, text: "最初" },
      { startSeconds: 4, endSeconds: null, text: "最後" },
    ],
  },
} satisfies LibraryTrack

describe("toLyricDocument", () => {
  it("normalizes persisted provider segments for the shared lyric workspace", () => {
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
        endSeconds: 120,
        parts: [{ text: "最後" }],
        translation: "",
      },
    ])
  })

  it("omits persisted blank timing markers without extending the prior line", () => {
    const document = toLyricDocument({
      ...track,
      lyrics: {
        ...track.lyrics!,
        segments: [
          { startSeconds: 87, endSeconds: 93, text: "Discordに耽美して" },
          { startSeconds: 93, endSeconds: 111, text: "" },
          { startSeconds: 111, endSeconds: null, text: "不条理" },
        ],
      },
    })

    expect(document?.segments).toHaveLength(2)
    expect(document?.segments[0]).toMatchObject({
      endSeconds: 93,
      parts: [{ text: "Discordに耽美して" }],
    })
    expect(document?.segments[1]).toMatchObject({ startSeconds: 111 })
  })

  it("applies the source binding timing offset to synchronized segments", () => {
    const document = toLyricDocument({
      ...track,
      lyrics: { ...track.lyrics!, timingOffsetMs: 750 },
    })

    expect(document?.segments[0]).toMatchObject({
      startSeconds: 1.75,
      endSeconds: 4.75,
    })
    expect(document?.segments[1]).toMatchObject({
      startSeconds: 4.75,
      endSeconds: 120.75,
    })
  })
})
