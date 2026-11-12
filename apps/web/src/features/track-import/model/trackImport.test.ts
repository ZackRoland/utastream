import { describe, expect, it } from "vitest"

import { initialTrackImportState, trackImportReducer } from "./trackImport"

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
    }

    expect(trackImportReducer(selected, { type: "close" })).toEqual(
      initialTrackImportState,
    )
  })
})
