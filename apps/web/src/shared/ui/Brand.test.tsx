import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Brand } from "./Brand"

describe("Brand", () => {
  it("provides an accessible product name", () => {
    render(<Brand />)

    expect(screen.getByLabelText("UtaStream")).toBeInTheDocument()
  })
})
