import { formatTrackDuration } from "../lib/formatTrackDuration"
import type { Track, TrackId } from "../model/track"
import { MusicCard } from "./MusicCard"
import { TrackArtwork } from "./TrackArtwork"

type TrackCardProps = {
  track: Track
  selected: boolean
  onSelect: (trackId: TrackId) => void
}

export function TrackCard({ track, selected, onSelect }: TrackCardProps) {
  return (
    <MusicCard
      artwork={<TrackArtwork track={track} />}
      title={track.japaneseTitle}
      titleLanguage="ja"
      details={`${track.artist} · ${track.genre} · ${formatTrackDuration(track.durationSeconds)}`}
      status={
        !track.mediaAsset
          ? "Media source pending"
          : track.lyricStatus === "ready"
            ? "Lyrics ready"
            : "Lyrics unavailable"
      }
      selected={selected}
      disabled={!track.mediaAsset}
      onSelect={() => onSelect(track.id)}
    />
  )
}
