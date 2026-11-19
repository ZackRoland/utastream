import { describe, expect, it, vi } from "vitest"

import { HttpClient } from "../../../shared/api/httpClient"
import { LibraryApi } from "./libraryApi"

describe("LibraryApi", () => {
  it("posts completion through the owned generated-contract transport", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ item: {}, trackCreated: true }), {
        status: 200,
      }),
    )
    const api = new LibraryApi(new HttpClient({ fetcher }))
    const body = { userId: "user" } as never

    await api.completeImport(body)

    expect(fetcher).toHaveBeenCalledWith(
      "/api/v1/track-imports",
      expect.objectContaining({
        body: JSON.stringify(body),
        method: "POST",
      }),
    )
  })
})
