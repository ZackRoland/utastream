import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import type { PlaybackSourceProbe } from "../model/trackImport"
import { LyricMatchStep } from "./LyricMatchStep"

const sourceProbe: PlaybackSourceProbe = {
  kind: "local_file",
  externalId: null,
  normalizedUrl: null,
  durationSeconds: 181,
  availability: "local_file_required",
  searchMetadata: { title: "夜の向こう", artist: "Uta" },
  originalMetadata: { filename: "song.mp3" },
  capabilities: {
    requiresVisiblePlayer: false,
    supportsSeeking: true,
    portableAcrossDevices: false,
  },
  provenance: { provider: "local_file", inspectedAt: "2026-11-11T00:00:00Z" },
}

const strongCandidate = {
  providerRecordId: "42",
  title: "夜の向こう",
  artist: "Uta",
  album: "Blue",
  durationSeconds: 180,
  durationDifferenceSeconds: 1,
  instrumental: false,
  plainLyrics: "夜の向こう",
  syncedLyrics: "[00:01.00] 夜の向こう",
  score: 98,
  confidenceBand: "strong" as const,
  warnings: [],
  matchingPolicyVersion: "metadata-v1",
  sourceProvider: "lrclib" as const,
  attribution: "Lyrics supplied by LRCLIB",
  lyricDocumentVersion: 1,
  timingType: "line" as const,
  normalizedSegments: [
    { startSeconds: 1, endSeconds: null, text: "夜の向こう" },
  ],
  rightsCapabilities: {
    status: "unknown",
    display: true,
    timedSynchronization: true,
  },
}

describe("LyricMatchStep", () => {
  it("requires confirmation even when a strong candidate is preselected", async () => {
    const lookup = vi.fn().mockResolvedValue({
      status: "ready",
      candidates: [strongCandidate],
      retryAfterSeconds: null,
    })
    render(<LyricMatchStep sourceProbe={sourceProbe} onReplace={vi.fn()} lookup={lookup} />)

    fireEvent.click(screen.getByRole("button", { name: "Search lyrics" }))
    expect(await screen.findByText("98/100 · strong · 180 seconds")).toBeVisible()
    expect(screen.getByRole("radio", { name: /夜の向こう/ })).toBeChecked()
    fireEvent.change(screen.getByLabelText("Timing offset (milliseconds)"), {
      target: { value: "350" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Confirm recording and lyrics" }))

    expect(screen.getByRole("heading", { name: "Ready to add to the library" })).toBeVisible()
    expect(screen.getByText("metadata-v1")).toBeVisible()
    expect(screen.getByText("350 ms")).toBeVisible()
  })

  it.each([
    ["missing", "No lyric candidates found"],
    ["rate_limited", "LRCLIB asked us to wait 12 seconds"],
    ["unavailable", "Lyrics are temporarily unavailable"],
    ["timeout", "Lyric lookup timed out"],
    ["overloaded", "LRCLIB is temporarily overloaded"],
  ] as const)("keeps playback independent for %s results", async (status, message) => {
    const lookup = vi.fn().mockResolvedValue({
      status,
      candidates: [],
      retryAfterSeconds: status === "rate_limited" ? 12 : null,
    })
    render(<LyricMatchStep sourceProbe={sourceProbe} onReplace={vi.fn()} lookup={lookup} />)
    fireEvent.click(screen.getByRole("button", { name: "Search lyrics" }))

    await waitFor(() => expect(screen.getByText(new RegExp(message))).toBeVisible())
    expect(screen.getByText(/Playback is unaffected|continue listening/)).toBeVisible()
  })

  it("does not preselect an ambiguous wrong-edition candidate", async () => {
    const lookup = vi.fn().mockResolvedValue({
      status: "ready",
      candidates: [{
        ...strongCandidate,
        providerRecordId: "43",
        title: "夜の向こう Live",
        score: 78,
        confidenceBand: "ambiguous",
        warnings: ["Edition or performance qualifiers differ."],
      }],
      retryAfterSeconds: null,
    })
    render(<LyricMatchStep sourceProbe={sourceProbe} onReplace={vi.fn()} lookup={lookup} />)
    fireEvent.click(screen.getByRole("button", { name: "Search lyrics" }))

    expect(await screen.findByText("Edition or performance qualifiers differ.")).toBeVisible()
    expect(screen.getByRole("radio", { name: /夜の向こう Live/ })).not.toBeChecked()
    expect(screen.getByRole("button", { name: "Confirm recording and lyrics" })).toBeDisabled()
  })

  it("retains rejected candidates for the active import", async () => {
    const lookup = vi.fn().mockResolvedValue({
      status: "ready",
      candidates: [strongCandidate],
      retryAfterSeconds: null,
    })
    render(<LyricMatchStep sourceProbe={sourceProbe} onReplace={vi.fn()} lookup={lookup} />)
    fireEvent.click(screen.getByRole("button", { name: "Search lyrics" }))
    await screen.findByRole("radio", { name: /夜の向こう/ })

    fireEvent.click(screen.getByRole("button", { name: "Reject candidate" }))
    expect(screen.queryByRole("radio", { name: /夜の向こう/ })).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Search lyrics" }))
    await waitFor(() => expect(lookup).toHaveBeenCalledTimes(2))
    expect(screen.queryByRole("radio", { name: /夜の向こう/ })).toBeNull()
  })
})
