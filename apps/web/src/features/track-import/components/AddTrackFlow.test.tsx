import { fireEvent, render, screen } from "@testing-library/react"
import { useReducer } from "react"
import { describe, expect, it, vi } from "vitest"

import {
  initialTrackImportState,
  trackImportReducer,
} from "../model/trackImport"
import { AddTrackFlow } from "./AddTrackFlow"

function Harness() {
  const [state, dispatch] = useReducer(trackImportReducer, {
    ...initialTrackImportState,
    step: "choose_source",
  })

  return <AddTrackFlow state={state} dispatch={dispatch} onClose={vi.fn()} />
}

describe("AddTrackFlow", () => {
  it("routes local files through shared guidance to the local adapter", () => {
    render(<Harness />)

    expect(screen.getByRole("dialog")).toHaveAccessibleName(
      "How would you like to listen?",
    )
    expect(screen.getByRole("heading", { name: "How to choose" })).toBeVisible()

    fireEvent.click(screen.getByRole("button", { name: /Choose an audio file/ }))
    expect(
      screen.getByRole("heading", { name: "Use a file you’re allowed to play" }),
    ).toBeVisible()
    expect(screen.getByText(/does not upload the audio/)).toBeVisible()

    fireEvent.click(
      screen.getByRole("button", { name: "I understand, continue" }),
    )
    expect(
      screen.getByRole("heading", { name: "Choose audio from this device" }),
    ).toBeVisible()
    expect(screen.getByLabelText("Choose audio file")).toBeInTheDocument()
    expect(screen.getByText(/temporary local URL/)).toBeVisible()
  })

  it("explains YouTube storage, visibility, availability, and rights", () => {
    render(<Harness />)

    fireEvent.click(screen.getByRole("button", { name: /Paste a video link/ }))

    expect(
      screen.getByRole("heading", { name: "Use the official visible player" }),
    ).toBeVisible()
    expect(screen.getByText(/not iframe markup or copied media/)).toBeVisible()
    expect(screen.getByText(/non-embeddable video may need replacement/)).toBeVisible()
    expect(screen.getByText(/does not transfer media or lyric rights/)).toBeVisible()
  })
})
