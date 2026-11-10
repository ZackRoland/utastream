import type { LyricDocument, LyricPart } from "../model/lyricDocument"

type FixtureSegment = {
  startSeconds: number
  parts: LyricPart[]
  translation: string
}

const segments: FixtureSegment[] = [
  { startSeconds: 0, parts: [{ text: "夜", reading: "よる" }, { text: "の" }, { text: "街", reading: "まち" }, { text: "に、" }, { text: "灯", reading: "あか" }, { text: "りがともる。" }], translation: "Lights come on in the city at night." },
  { startSeconds: 16, parts: [{ text: "名前", reading: "なまえ" }, { text: "のない" }, { text: "風", reading: "かぜ" }, { text: "を" }, { text: "追", reading: "お" }, { text: "いかけた。" }], translation: "I chased a wind with no name." },
  { startSeconds: 32, parts: [{ text: "ポケットの" }, { text: "中", reading: "なか" }, { text: "、" }, { text: "小", reading: "ちい" }, { text: "さな" }, { text: "勇気", reading: "ゆうき" }, { text: "。" }], translation: "A little courage, tucked into my pocket." },
  { startSeconds: 49, parts: [{ text: "まだ" }, { text: "言", reading: "い" }, { text: "えない" }, { text: "言葉", reading: "ことば" }, { text: "がある。" }], translation: "There are still words I can’t say." },
  { startSeconds: 66, parts: [{ text: "遠回", reading: "とおまわ" }, { text: "りしても、" }, { text: "君", reading: "きみ" }, { text: "に" }, { text: "会", reading: "あ" }, { text: "いたい。" }], translation: "Even if I take the long way, I want to see you." },
  { startSeconds: 86, parts: [{ text: "夜", reading: "よる" }, { text: "の" }, { text: "向", reading: "む" }, { text: "こうで、" }, { text: "君", reading: "きみ" }, { text: "が" }, { text: "笑", reading: "わら" }, { text: "っている。" }], translation: "Beyond the night, you’re smiling." },
  { startSeconds: 104, parts: [{ text: "雨", reading: "あめ" }, { text: "の" }, { text: "匂", reading: "にお" }, { text: "いを、" }, { text: "忘", reading: "わす" }, { text: "れないように。" }], translation: "So I won’t forget the scent of the rain." },
  { startSeconds: 122, parts: [{ text: "僕", reading: "ぼく" }, { text: "らの" }, { text: "明日", reading: "あした" }, { text: "は、まだ" }, { text: "白", reading: "しろ" }, { text: "いまま。" }], translation: "Our tomorrow is still an unwritten page." },
  { startSeconds: 141, parts: [{ text: "立", reading: "た" }, { text: "ち" }, { text: "止", reading: "ど" }, { text: "まっても、" }, { text: "空", reading: "そら" }, { text: "は" }, { text: "続", reading: "つづ" }, { text: "く。" }], translation: "Even when I stop, the sky goes on." },
  { startSeconds: 161, parts: [{ text: "遠回", reading: "とおまわ" }, { text: "りしても、" }, { text: "君", reading: "きみ" }, { text: "に" }, { text: "会", reading: "あ" }, { text: "いたい。" }], translation: "Even if I take the long way, I want to see you." },
  { startSeconds: 183, parts: [{ text: "新", reading: "あたら" }, { text: "しい" }, { text: "朝", reading: "あさ" }, { text: "を、" }, { text: "一緒", reading: "いっしょ" }, { text: "に" }, { text: "迎", reading: "むか" }, { text: "えよう。" }], translation: "Let’s welcome a new morning together." },
  { startSeconds: 202, parts: [{ text: "この" }, { text: "歌", reading: "うた" }, { text: "が、" }, { text: "君", reading: "きみ" }, { text: "に" }, { text: "届", reading: "とど" }, { text: "きますように。" }], translation: "May this song find its way to you." },
]

export const beyondTheNightLyrics: LyricDocument = {
  id: "lyrics-yoru-ja",
  trackId: "yoru",
  version: 1,
  language: "ja",
  segments: segments.map((segment, index) => ({
    id: `yoru-${index + 1}`,
    ...segment,
    endSeconds: segments[index + 1]?.startSeconds ?? 218,
  })),
}
