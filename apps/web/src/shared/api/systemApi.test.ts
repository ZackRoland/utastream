import { describe, expect, it, vi } from "vitest"

import { ApiClientError, HttpClient } from "./httpClient"
import { SystemApi } from "./systemApi"

describe("SystemApi", () => {
  it("uses generated response types through the owned transport", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ status: "ok" }), {
        headers: { "content-type": "application/json" },
        status: 200,
      }),
    )
    const api = new SystemApi(
      new HttpClient({ baseUrl: "https://api.example.test/", fetcher }),
    )

    await expect(api.getHealth()).resolves.toEqual({ status: "ok" })
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.test/health",
      expect.objectContaining({
        credentials: "same-origin",
        method: "GET",
      }),
    )
  })

  it("forwards cancellation signals", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ status: "ready", checks: { api: "ok" } })),
    )
    const api = new SystemApi(new HttpClient({ fetcher }))
    const controller = new AbortController()

    await api.getReadiness({ signal: controller.signal })

    expect(fetcher).toHaveBeenCalledWith(
      "/api/ready",
      expect.objectContaining({ signal: controller.signal }),
    )
  })

  it("normalizes the shared API error envelope", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: "SERVICE_UNAVAILABLE",
            message: "The service is not ready.",
            requestId: "request-123",
          },
        }),
        { status: 503 },
      ),
    )
    const api = new SystemApi(new HttpClient({ fetcher }))

    const request = api.getReadiness()

    await expect(request).rejects.toBeInstanceOf(ApiClientError)
    await expect(request).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
      message: "The service is not ready.",
      requestId: "request-123",
      status: 503,
    })
  })
})
