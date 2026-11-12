import { describe, expect, it } from "vitest"

import { inferTitleFromFilename, isPossibleAudioFile } from "./localFileMetadata"

describe("local-file metadata", () => {
  it("creates editable search text without changing the original filename", () => {
    expect(inferTitleFromFilename("yoru-no_machi.demo.mp3")).toBe(
      "yoru no machi.demo",
    )
  })

  it("accepts audio MIME types and known extensions when MIME is absent", () => {
    expect(isPossibleAudioFile(new File(["audio"], "song.bin", { type: "audio/mpeg" }))).toBe(
      true,
    )
    expect(isPossibleAudioFile(new File(["audio"], "song.flac"))).toBe(true)
  })

  it("rejects empty or clearly non-audio files", () => {
    expect(isPossibleAudioFile(new File([], "empty.mp3", { type: "audio/mpeg" }))).toBe(
      false,
    )
    expect(isPossibleAudioFile(new File(["text"], "notes.txt", { type: "text/plain" }))).toBe(
      false,
    )
  })
})
