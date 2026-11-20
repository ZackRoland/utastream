import type { operations } from "@utastream/api-contract"

import { HttpClient, type RequestOptions } from "../../../shared/api/httpClient"

export type CompleteTrackImportRequest =
  operations["completeTrackImport"]["requestBody"]["content"]["application/json"]
export type CompleteTrackImportResponse =
  operations["completeTrackImport"]["responses"][200]["content"]["application/json"]
export type LibraryResponse =
  operations["getUserLibrary"]["responses"][200]["content"]["application/json"]
export type LibraryTrack = LibraryResponse["items"][number]
export type ReplaceTrackLyricsRequest =
  operations["replaceLibraryTrackLyrics"]["requestBody"]["content"]["application/json"]
export type ReplaceTrackLyricsResponse =
  operations["replaceLibraryTrackLyrics"]["responses"][200]["content"]["application/json"]

export class LibraryApi {
  constructor(private readonly http: HttpClient = new HttpClient()) {}

  completeImport(
    request: CompleteTrackImportRequest,
    options?: RequestOptions,
  ): Promise<CompleteTrackImportResponse> {
    return this.http.post<CompleteTrackImportResponse>("/v1/track-imports", {
      body: request,
      signal: options?.signal,
    })
  }

  getLibrary(userId: string, options?: RequestOptions): Promise<LibraryResponse> {
    return this.http.get<LibraryResponse>(`/v1/users/${userId}/library`, options)
  }

  replaceLyrics(
    userId: string,
    trackId: string,
    sourceId: string,
    request: ReplaceTrackLyricsRequest,
    options?: RequestOptions,
  ): Promise<ReplaceTrackLyricsResponse> {
    return this.http.put<ReplaceTrackLyricsResponse>(
      `/v1/users/${userId}/library/${trackId}/sources/${sourceId}/lyrics`,
      { body: request, signal: options?.signal },
    )
  }
}
