import type { operations } from "@utastream/api-contract"

import { HttpClient, type RequestOptions } from "../../../../shared/api/httpClient"

export type YouTubeMetadataResponse =
  operations["getYouTubeMetadata"]["responses"][200]["content"]["application/json"]

export class YouTubeMetadataApi {
  constructor(private readonly http: HttpClient = new HttpClient()) {}

  getMetadata(
    videoId: string,
    options?: RequestOptions,
  ): Promise<YouTubeMetadataResponse> {
    const search = new URLSearchParams({ video_id: videoId })
    return this.http.get<YouTubeMetadataResponse>(
      `/v1/youtube/metadata?${search.toString()}`,
      options,
    )
  }
}
