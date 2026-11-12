export type TrackId = string

export type ArtworkTone = "gold" | "blue" | "red" | "green"

export type FixtureMediaAsset = {
  src: string
  mimeType: "audio/mpeg"
  expectedDurationSeconds: number
  provenance: {
    creator: string
    license: "CC0-1.0"
  }
}

export type Track = {
  id: TrackId
  japaneseTitle: string
  englishTitle: string
  artist: string
  genre: string
  durationSeconds: number
  mediaAsset: FixtureMediaAsset | null
  artwork: {
    src: string
    alt: string
    tone: ArtworkTone
    label: string
    caption: string
  }
  lyricStatus: "ready" | "unavailable"
}
