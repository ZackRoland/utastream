const AUDIO_EXTENSIONS = new Set([
  "aac",
  "flac",
  "m4a",
  "mp3",
  "oga",
  "ogg",
  "opus",
  "wav",
  "webm",
])

export function inferTitleFromFilename(filename: string): string {
  const withoutExtension = filename.replace(/\.[^.]+$/, "")
  return withoutExtension.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim()
}

export function isPossibleAudioFile(file: File): boolean {
  if (file.size <= 0) return false
  if (file.type) return file.type.startsWith("audio/")

  const extension = file.name.split(".").pop()?.toLowerCase()
  return !!extension && AUDIO_EXTENSIONS.has(extension)
}
