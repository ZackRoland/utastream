import { describe, expect, it } from "vitest"

import { initialTrackImportState, trackImportReducer } from "./trackImport"

const youtubeProbe = {
  kind: "youtube" as const,
  externalId: "M7lc1UVf-VE",
  normalizedUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
  durationSeconds: 137,
  availability: "available" as const,
  searchMetadata: null,
  originalMetadata: {},
  capabilities: {
    requiresVisiblePlayer: true,
    supportsSeeking: true,
    portableAcrossDevices: true,
  },
  provenance: {
    provider: "youtube" as const,
    inspectedAt: "2026-11-11T00:00:00.000Z",
  },
}

describe("trackImportReducer", () => {
  it("moves both source kinds through the same lifecycle", () => {
    for (const sourceKind of ["local_file", "youtube"] as const) {
      const choosing = trackImportReducer(initialTrackImportState, {
        type: "open",
      })
      const guidance = trackImportReducer(choosing, {
        type: "select_source",
        sourceKind,
      })
      const awaitingSource = trackImportReducer(guidance, { type: "continue" })

      expect(awaitingSource).toEqual({
        step: "awaiting_source",
        sourceKind,
        sourceProbe: null,
      })
      expect(trackImportReducer(awaitingSource, { type: "back" })).toEqual(
        guidance,
      )
    }
  })

  it("clears source-specific state whenever the flow closes", () => {
    const selected = {
      step: "review_guidance" as const,
      sourceKind: "youtube" as const,
      sourceProbe: null,
    }

    expect(trackImportReducer(selected, { type: "close" })).toEqual(
      initialTrackImportState,
    )
  })

  it("stores normalized source facts without provider objects or iframe markup", () => {
    const awaitingSource = {
      step: "awaiting_source" as const,
      sourceKind: "youtube" as const,
      sourceProbe: null,
    }
    const ready = trackImportReducer(awaitingSource, {
      type: "source_ready",
      sourceProbe: youtubeProbe,
    })
    const confirmed = trackImportReducer(ready, { type: "confirm_source" })

    expect(confirmed).toMatchObject({
      step: "source_confirmed",
      sourceProbe: youtubeProbe,
    })
    expect(JSON.stringify(confirmed)).not.toContain("iframe")
    expect(trackImportReducer(confirmed, { type: "replace_source" })).toEqual({
      step: "awaiting_source",
      sourceKind: "youtube",
      sourceProbe: null,
    })
  })
})
