export type LyricPart = {
  text: string
  reading?: string
}

export type LyricSegment = {
  id: string
  startSeconds: number
  endSeconds: number
  parts: LyricPart[]
  translation: string
}

export type LyricDocument = {
  id: string
  trackId: string
  version: number
  language: "ja"
  segments: LyricSegment[]
}
