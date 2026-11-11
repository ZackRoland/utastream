import type { operations } from "@utastream/api-contract"

import { HttpClient, type RequestOptions } from "./httpClient"

export type HealthResponse =
  operations["getHealth"]["responses"][200]["content"]["application/json"]
export type ReadinessResponse =
  operations["getReadiness"]["responses"][200]["content"]["application/json"]

export class SystemApi {
  constructor(private readonly http: HttpClient = new HttpClient()) {}

  getHealth(options?: RequestOptions): Promise<HealthResponse> {
    return this.http.get<HealthResponse>("/health", options)
  }

  getReadiness(options?: RequestOptions): Promise<ReadinessResponse> {
    return this.http.get<ReadinessResponse>("/ready", options)
  }
}
