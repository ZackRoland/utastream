import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { beyondTheNightExplanations } from "../fixtures/beyondTheNightExplanations"
import { ExpressionExplanationPanel } from "./ExpressionExplanationPanel"

describe("ExpressionExplanationPanel", () => {
  it("presents the fixture explanation and closes without owning playback", () => {
    const onClose = vi.fn()
    render(
      <ExpressionExplanationPanel
        explanation={beyondTheNightExplanations[0]}
        sentence="夜の街に、灯りがともる。"
        translation="Lights come on in the city at night."
        onClose={onClose}
      />,
    )

    expect(screen.getByText("が marks what comes into view")).toBeVisible()
    expect(screen.getByText("light; glow")).toBeVisible()
    fireEvent.click(screen.getByRole("button", { name: "Close expression explanation" }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
