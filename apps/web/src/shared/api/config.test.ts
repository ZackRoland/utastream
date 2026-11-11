import { describe, expect, it } from "vitest"

import { resolveApiBaseUrl } from "./config"

describe("resolveApiBaseUrl", () => {
  it("uses the same-origin development proxy by default", () => {
    expect(resolveApiBaseUrl()).toBe("/api")
  })

  it("normalizes an explicitly configured base URL", () => {
    expect(resolveApiBaseUrl(" https://api.example.test/v1/// ")).toBe(
      "https://api.example.test/v1",
    )
  })
})
