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

  it("puts an atomic lyric replacement at the source-scoped endpoint", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ item: {} }), { status: 200 }),
    )
    const api = new LibraryApi(new HttpClient({ fetcher }))
    const body = { lyrics: { providerRecordId: "84" } } as never

    await api.replaceLyrics("user-1", "track-1", "source-1", body)

    expect(fetcher).toHaveBeenCalledWith(
      "/api/v1/users/user-1/library/track-1/sources/source-1/lyrics",
      expect.objectContaining({
        body: JSON.stringify(body),
        method: "PUT",
      }),
    )
  })
})
