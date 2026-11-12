import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import type { YouTubePlayerCallbacks } from "./youtubePlayer"
import { YouTubeSourceStep } from "./YouTubeSourceStep"

describe("YouTubeSourceStep", () => {
  it("mounts the official-player boundary and returns only normalized facts", async () => {
    let callbacks!: YouTubePlayerCallbacks
    const mountPlayer = vi.fn(async (_element, _videoId, playerCallbacks) => {
      callbacks = playerCallbacks
      return { destroy: vi.fn() }
    })
    const onSourceReady = vi.fn()

    render(
      <YouTubeSourceStep
        onBack={vi.fn()}
        onSourceReady={onSourceReady}
        mountPlayer={mountPlayer}
      />,
    )
    fireEvent.change(screen.getByLabelText("YouTube URL"), {
      target: { value: "https://youtu.be/M7lc1UVf-VE?si=discarded" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Load preview" }))

    await waitFor(() => expect(mountPlayer).toHaveBeenCalledOnce())
    expect(mountPlayer.mock.calls[0][1]).toBe("M7lc1UVf-VE")
    callbacks.onReady(137.4)

    await screen.findByText("Video available for embedded playback")
    fireEvent.click(
      screen.getByRole("button", { name: "Continue with this video" }),
    )

    expect(onSourceReady).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "youtube",
        externalId: "M7lc1UVf-VE",
        normalizedUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
        durationSeconds: 137.4,
        availability: "available",
        capabilities: {
          requiresVisiblePlayer: true,
          supportsSeeking: true,
          portableAcrossDevices: true,
        },
      }),
    )
    expect(JSON.stringify(onSourceReady.mock.calls[0][0])).not.toContain("iframe")
  })

  it("recovers from non-embeddable video without advancing the shared flow", async () => {
    let callbacks!: YouTubePlayerCallbacks
    const mountPlayer = vi.fn(async (_element, _videoId, playerCallbacks) => {
      callbacks = playerCallbacks
      return { destroy: vi.fn() }
    })

    render(
      <YouTubeSourceStep
        onBack={vi.fn()}
        onSourceReady={vi.fn()}
        mountPlayer={mountPlayer}
      />,
    )
    fireEvent.change(screen.getByLabelText("YouTube URL"), {
      target: { value: "https://youtube.com/watch?v=M7lc1UVf-VE" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Load preview" }))
    await waitFor(() => expect(mountPlayer).toHaveBeenCalledOnce())
    callbacks.onError({
      code: "not_embeddable",
      message: "The video owner does not allow playback in embedded players.",
      recoverable: true,
    })

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The video owner does not allow playback in embedded players.",
    )
    expect(
      screen.getByRole("button", { name: "Continue with this video" }),
    ).toBeDisabled()
    fireEvent.click(screen.getByRole("button", { name: "Enter another URL" }))
    expect(screen.queryByLabelText("YouTube source preview")).toBeNull()
  })

  it("rejects malformed URLs before loading provider code", () => {
    const mountPlayer = vi.fn()
    render(
      <YouTubeSourceStep
        onBack={vi.fn()}
        onSourceReady={vi.fn()}
        mountPlayer={mountPlayer}
      />,
    )
    fireEvent.change(screen.getByLabelText("YouTube URL"), {
      target: { value: "https://example.com/not-youtube" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Load preview" }))

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Use a youtube.com or youtu.be URL.",
    )
    expect(mountPlayer).not.toHaveBeenCalled()
  })
})
