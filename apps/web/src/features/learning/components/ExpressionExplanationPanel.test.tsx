import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { beyondTheNightExplanations } from "../fixtures/beyondTheNightExplanations"
import { ExpressionExplanationPanel } from "./ExpressionExplanationPanel"

describe("ExpressionExplanationPanel", () => {
  it("presents the fixture explanation and closes without owning playback", () => {
    const onClose = vi.fn()
    const onSave = vi.fn()
    render(
      <ExpressionExplanationPanel
        explanation={beyondTheNightExplanations[0]}
        sentence="夜の街に、灯りがともる。"
        translation="Lights come on in the city at night."
        saved={false}
        onSave={onSave}
        onClose={onClose}
      />,
    )

    expect(screen.getByText("が marks what comes into view")).toBeVisible()
    expect(screen.getByText("light; glow")).toBeVisible()
    fireEvent.click(screen.getByRole("button", { name: "Save expression" }))
    fireEvent.click(screen.getByRole("button", { name: "Close expression explanation" }))
    expect(onSave).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it("shows confirmation and prevents another save when already saved", () => {
    render(
      <ExpressionExplanationPanel
        explanation={beyondTheNightExplanations[0]}
        sentence="夜の街に、灯りがともる。"
        translation="Lights come on in the city at night."
        saved
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByRole("button", { name: "Expression saved" })).toHaveAttribute(
      "aria-disabled",
      "true",
    )
    expect(screen.getByText("Saved with its song and lyric.")).toBeVisible()
  })

  it("labels the shared interaction model for a kanji selection", () => {
    const kanjiExplanation = beyondTheNightExplanations.find(
      (explanation) => explanation.selectionKind === "kanji",
    )
    expect(kanjiExplanation).toBeDefined()

    render(
      <ExpressionExplanationPanel
        explanation={kanjiExplanation!}
        sentence="夜の街に、灯りがともる。"
        translation="Lights come on in the city at night."
        saved={false}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByRole("button", { name: "Save kanji" })).toBeVisible()
    expect(
      screen.getByRole("button", { name: "Close kanji explanation" }),
    ).toBeVisible()
  })
})
