export type TrackId = string

export type ArtworkTone = "gold" | "blue" | "red" | "green"

export type Track = {
  id: TrackId
  japaneseTitle: string
  englishTitle: string
  artist: string
  genre: string
  durationSeconds: number
  artwork: {
    src: string
    alt: string
    tone: ArtworkTone
    label: string
    caption: string
  }
  lyricStatus: "ready" | "unavailable"
}
