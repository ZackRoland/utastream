import type { components } from "@utastream/api-contract"

import { resolveApiBaseUrl } from "./config"

type ErrorEnvelope = components["schemas"]["ErrorEnvelope"]

export interface HttpClientOptions {
  baseUrl?: string
  fetcher?: typeof fetch
}

export interface RequestOptions {
  signal?: AbortSignal
}

export class ApiClientError extends Error {
  readonly code: string
  readonly requestId: string | null
  readonly status: number

  constructor(options: {
    code: string
    message: string
    requestId: string | null
    status: number
  }) {
    super(options.message)
    this.name = "ApiClientError"
    this.code = options.code
    this.requestId = options.requestId
    this.status = options.status
  }
}

export class HttpClient {
  readonly #baseUrl: string
  readonly #fetcher: typeof fetch

  constructor(options: HttpClientOptions = {}) {
    this.#baseUrl = resolveApiBaseUrl(options.baseUrl)
    this.#fetcher = options.fetcher ?? globalThis.fetch.bind(globalThis)
  }

  async get<TResponse>(path: `/${string}`, options: RequestOptions = {}) {
    const response = await this.#fetcher(`${this.#baseUrl}${path}`, {
      credentials: "same-origin",
      headers: { Accept: "application/json" },
      method: "GET",
      signal: options.signal,
    })

    if (!response.ok) {
      throw await normalizeApiError(response)
    }

    return (await response.json()) as TResponse
  }
}

async function normalizeApiError(response: Response): Promise<ApiClientError> {
  const requestIdHeader = response.headers.get("x-request-id")
  const body = await response.json().catch(() => null)

  if (isErrorEnvelope(body)) {
    return new ApiClientError({
      code: body.error.code,
      message: body.error.message,
      requestId: body.error.requestId || requestIdHeader,
      status: response.status,
    })
  }

  return new ApiClientError({
    code: `HTTP_${response.status}`,
    message: "The API request failed.",
    requestId: requestIdHeader,
    status: response.status,
  })
}

function isErrorEnvelope(value: unknown): value is ErrorEnvelope {
  if (!value || typeof value !== "object" || !("error" in value)) {
    return false
  }

  const error = value.error
  return (
    !!error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string" &&
    "message" in error &&
    typeof error.message === "string" &&
    "requestId" in error &&
    typeof error.requestId === "string"
  )
}
