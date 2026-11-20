export function formatTrackDuration(durationSeconds: number): string {
  const minutes = Math.floor(durationSeconds / 60)
  const seconds = Math.floor(durationSeconds % 60)

  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}
