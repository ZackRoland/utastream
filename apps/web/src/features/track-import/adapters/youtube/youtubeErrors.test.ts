import { describe, expect, it } from "vitest"

import { mapYouTubePlayerError } from "./youtubeErrors"

describe("mapYouTubePlayerError", () => {
  it.each([101, 150])("maps error %s to a replaceable non-embed state", (code) => {
    expect(mapYouTubePlayerError(code)).toMatchObject({
      code: "not_embeddable",
      recoverable: true,
    })
  })

  it("distinguishes removed or private videos", () => {
    expect(mapYouTubePlayerError(100).code).toBe("unavailable")
  })

  it("keeps undocumented player failures recoverable", () => {
    expect(mapYouTubePlayerError(5)).toMatchObject({
      code: "playback_failed",
      recoverable: true,
    })
  })

  it("identifies a missing referrer or equivalent client identity", () => {
    expect(mapYouTubePlayerError(153).code).toBe("client_identity_required")
  })
})
