import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { LocalFileSourceStep } from "./LocalFileSourceStep"

function selectAudio(name = "Artist - Demo Song.mp3") {
  const file = new File([new Uint8Array([1, 2, 3])], name, {
    type: "audio/mpeg",
    lastModified: 1234,
  })
  fireEvent.change(screen.getByLabelText(/Choose (audio|a different) file/), {
    target: { files: [file] },
  })
  return file
}

function reportDuration(seconds: number) {
  const audio = screen.getByLabelText("Local audio preview").querySelector("audio")
  if (!audio) throw new Error("Expected an audio preview")
  Object.defineProperty(audio, "duration", { configurable: true, value: seconds })
  fireEvent.loadedMetadata(audio)
}

describe("LocalFileSourceStep", () => {
  it("previews through an object URL and returns only serializable metadata", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")
    const createObjectURL = vi.fn(() => "blob:temporary-preview")
    const revokeObjectURL = vi.fn()
    const onSourceReady = vi.fn()

    render(
      <LocalFileSourceStep
        onBack={vi.fn()}
        onSourceReady={onSourceReady}
        objectUrlApi={{ createObjectURL, revokeObjectURL }}
      />,
    )

    const file = selectAudio()
    expect(createObjectURL).toHaveBeenCalledWith(file)
    expect(screen.getByText("Artist - Demo Song.mp3")).toBeVisible()
    expect(screen.getByRole("button", { name: "Continue with this file" })).toBeDisabled()

    reportDuration(185.8)
    fireEvent.change(screen.getByLabelText("Track title"), {
      target: { value: "Demo Song" },
    })
    fireEvent.change(screen.getByLabelText(/Artist/), {
      target: { value: "Demo Artist" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Continue with this file" }))

    const probe = onSourceReady.mock.calls[0][0]
    expect(probe).toMatchObject({
      kind: "local_file",
      externalId: null,
      normalizedUrl: null,
      durationSeconds: 185.8,
      availability: "local_file_required",
      searchMetadata: { title: "Demo Song", artist: "Demo Artist" },
      originalMetadata: {
        filename: "Artist - Demo Song.mp3",
        mimeType: "audio/mpeg",
        sizeBytes: 3,
        lastModified: 1234,
      },
    })
    const serialized = JSON.stringify(probe)
    expect(serialized).not.toContain("blob:")
    expect(serialized).not.toContain("temporary-preview")
    expect(probe).not.toHaveProperty("file")
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("revokes replaced and unmounted preview URLs", () => {
    const createObjectURL = vi
      .fn()
      .mockReturnValueOnce("blob:first")
      .mockReturnValueOnce("blob:second")
    const revokeObjectURL = vi.fn()
    const view = render(
      <LocalFileSourceStep
        onBack={vi.fn()}
        onSourceReady={vi.fn()}
        objectUrlApi={{ createObjectURL, revokeObjectURL }}
      />,
    )

    selectAudio("first.mp3")
    selectAudio("second.mp3")
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:first")

    view.unmount()
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:second")
    expect(revokeObjectURL).toHaveBeenCalledTimes(2)
  })

  it("rejects empty files before creating a preview URL", () => {
    const createObjectURL = vi.fn()
    render(
      <LocalFileSourceStep
        onBack={vi.fn()}
        onSourceReady={vi.fn()}
        objectUrlApi={{ createObjectURL, revokeObjectURL: vi.fn() }}
      />,
    )

    const empty = new File([], "empty.mp3", { type: "audio/mpeg" })
    fireEvent.change(screen.getByLabelText("Choose audio file"), {
      target: { files: [empty] },
    })

    expect(screen.getByRole("alert")).toHaveTextContent("non-empty audio file")
    expect(createObjectURL).not.toHaveBeenCalled()
  })
})
