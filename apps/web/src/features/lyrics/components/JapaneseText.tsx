import type { LyricPart } from "../model/lyricDocument"

type JapaneseTextProps = {
  parts: LyricPart[]
}

export function JapaneseText({ parts }: JapaneseTextProps) {
  return <>{parts.map((part) => part.text).join("")}</>
}
