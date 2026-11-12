import { describe, expect, it } from "vitest"

import { InvalidYouTubeUrlError, parseYouTubeUrl } from "./youtubeUrl"

describe("parseYouTubeUrl", () => {
  it.each([
    "https://www.youtube.com/watch?v=M7lc1UVf-VE&t=10",
    "https://youtu.be/M7lc1UVf-VE?si=example",
    "https://youtube.com/shorts/M7lc1UVf-VE",
    "https://m.youtube.com/embed/M7lc1UVf-VE",
    "https://music.youtube.com/watch?v=M7lc1UVf-VE",
  ])("normalizes supported URL shapes without retaining extra parameters", (url) => {
    expect(parseYouTubeUrl(url)).toEqual({
      videoId: "M7lc1UVf-VE",
      normalizedUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
    })
  })

  it.each([
    "M7lc1UVf-VE",
    "http://youtube.com/watch?v=M7lc1UVf-VE",
    "https://example.com/watch?v=M7lc1UVf-VE",
    "https://user@youtube.com/watch?v=M7lc1UVf-VE",
    "https://youtube.com:444/watch?v=M7lc1UVf-VE",
    "https://youtube.com/watch?v=too-short",
    "https://youtube.com/channel/M7lc1UVf-VE",
  ])("rejects unsupported or unsafe input: %s", (url) => {
    expect(() => parseYouTubeUrl(url)).toThrow(InvalidYouTubeUrlError)
  })
})
