import type { operations } from "@utastream/api-contract"

import { HttpClient, type RequestOptions } from "../../../shared/api/httpClient"

export type LyricCandidateResponse =
  operations["getLyricCandidates"]["responses"][200]["content"]["application/json"]
export type LyricCandidate = LyricCandidateResponse["candidates"][number]

export type LyricCandidateQuery = {
  title: string
  artist: string
  album?: string
  durationSeconds?: number
}

export class LyricsApi {
  constructor(private readonly http: HttpClient = new HttpClient()) {}

  getCandidates(
    query: LyricCandidateQuery,
    options?: RequestOptions,
  ): Promise<LyricCandidateResponse> {
    const search = new URLSearchParams({ title: query.title, artist: query.artist })
    if (query.album) search.set("album", query.album)
    if (query.durationSeconds !== undefined) {
      search.set("duration_seconds", String(query.durationSeconds))
    }
    return this.http.get<LyricCandidateResponse>(
      `/v1/lyrics/candidates?${search.toString()}`,
      options,
    )
  }
}
