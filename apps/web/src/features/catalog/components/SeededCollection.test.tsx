import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { seededTracks } from "../fixtures/seededTracks"
import { SeededCollection } from "./SeededCollection"

describe("SeededCollection", () => {
  it("emits the selected track id without starting playback", () => {
    const onTrackSelect = vi.fn()

    render(
      <SeededCollection
        tracks={seededTracks}
        selectedTrackId={null}
        onTrackSelect={onTrackSelect}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: /夜の向こう/i }))

    expect(onTrackSelect).toHaveBeenCalledWith("yoru")
    expect(onTrackSelect).toHaveBeenCalledTimes(1)
    expect(
      screen.getByRole("button", { name: /Beyond the Night.*3:38/ }),
    ).toBeVisible()
  })
})
