type LyricPart = {
  text: string
  reading?: string
}
type Vocabulary = {
  word: string
  reading: string
  meaning: string
}
export type Lyric = {
  start: number
  parts: LyricPart[]
  translation: string
  expression: string
  reading: string
  meaning: string
  grammarTitle: string
  grammar: string
  vocabulary: Vocabulary[]
}

export const lyrics: Lyric[] = [
  {
    start: 0,
    parts: [
      { text: "夜", reading: "よる" },
      { text: "の" },
      { text: "街", reading: "まち" },
      { text: "に、" },
      { text: "灯", reading: "あか" },
      { text: "りがともる。" },
    ],
    translation: "Lights come on in the city at night.",
    expression: "灯りがともる",
    reading: "あかりがともる",
    meaning: "The lights come on.",
    grammarTitle: "が marks what comes into view",
    grammar:
      "灯りがともる describes lights appearing naturally. が points to the lights as the subject, rather than someone turning them on.",
    vocabulary: [
      { word: "灯り", reading: "あかり", meaning: "light; glow" },
      { word: "ともる", reading: "ともる", meaning: "to light up" },
    ],
  },
  {
    start: 16,
    parts: [
      { text: "名前", reading: "なまえ" },
      { text: "のない" },
      { text: "風", reading: "かぜ" },
      { text: "を" },
      { text: "追", reading: "お" },
      { text: "いかけた。" },
    ],
    translation: "I chased a wind with no name.",
    expression: "追いかけた",
    reading: "おいかけた",
    meaning: "I chased after it.",
    grammarTitle: "た · looking back",
    grammar:
      "追いかけた is the plain past form of 追いかける, “to chase.” The ending places this moment in a memory.",
    vocabulary: [
      { word: "名前", reading: "なまえ", meaning: "name" },
      { word: "追いかける", reading: "おいかける", meaning: "to chase after" },
    ],
  },
  {
    start: 32,
    parts: [
      { text: "ポケットの" },
      { text: "中", reading: "なか" },
      { text: "、" },
      { text: "小", reading: "ちい" },
      { text: "さな" },
      { text: "勇気", reading: "ゆうき" },
      { text: "。" },
    ],
    translation: "A little courage, tucked into my pocket.",
    expression: "小さな勇気",
    reading: "ちいさなゆうき",
    meaning: "A little bit of courage.",
    grammarTitle: "小さな · a gentle description",
    grammar:
      "小さな goes directly before a noun. Here it makes courage feel small but precious, like something you can carry.",
    vocabulary: [
      { word: "勇気", reading: "ゆうき", meaning: "courage" },
      { word: "小さな", reading: "ちいさな", meaning: "little; small" },
    ],
  },
  {
    start: 49,
    parts: [
      { text: "まだ" },
      { text: "言", reading: "い" },
      { text: "えない" },
      { text: "言葉", reading: "ことば" },
      { text: "がある。" },
    ],
    translation: "There are still words I can’t say.",
    expression: "まだ言えない",
    reading: "まだいえない",
    meaning: "I still can’t say it.",
    grammarTitle: "まだ + negative · not yet",
    grammar:
      "言えない is the negative potential form of 言う: “can’t say.” まだ adds “still” or “not yet,” suggesting that someday, you might.",
    vocabulary: [
      { word: "言葉", reading: "ことば", meaning: "word; words" },
      { word: "言える", reading: "いえる", meaning: "to be able to say" },
    ],
  },
  {
    start: 66,
    parts: [
      { text: "遠回", reading: "とおまわ" },
      { text: "りしても、" },
      { text: "君", reading: "きみ" },
      { text: "に" },
      { text: "会", reading: "あ" },
      { text: "いたい。" },
    ],
    translation: "Even if I take the long way, I want to see you.",
    expression: "遠回りしても",
    reading: "とおまわりしても",
    meaning: "Even if I take the long way.",
    grammarTitle: "ても · even if",
    grammar:
      "Add も to a verb’s て-form to say “even if.” 遠回りする becomes 遠回りしても. Here, the detour won’t change the wish to see someone.",
    vocabulary: [
      {
        word: "遠回り",
        reading: "とおまわり",
        meaning: "detour; the long way",
      },
      { word: "会いたい", reading: "あいたい", meaning: "want to see someone" },
    ],
  },
  {
    start: 86,
    parts: [
      { text: "夜", reading: "よる" },
      { text: "の" },
      { text: "向", reading: "む" },
      { text: "こうで、" },
      { text: "君", reading: "きみ" },
      { text: "が" },
      { text: "笑", reading: "わら" },
      { text: "っている。" },
    ],
    translation: "Beyond the night, you’re smiling.",
    expression: "笑っている",
    reading: "わらっている",
    meaning: "You’re smiling.",
    grammarTitle: "ている · a moment still unfolding",
    grammar:
      "笑う becomes 笑っている. The ている form describes an action happening now, letting the image of that smile linger.",
    vocabulary: [
      { word: "向こう", reading: "むこう", meaning: "beyond; the other side" },
      { word: "笑う", reading: "わらう", meaning: "to smile; to laugh" },
    ],
  },
  {
    start: 104,
    parts: [
      { text: "雨", reading: "あめ" },
      { text: "の" },
      { text: "匂", reading: "にお" },
      { text: "いを、" },
      { text: "忘", reading: "わす" },
      { text: "れないように。" },
    ],
    translation: "So I won’t forget the scent of the rain.",
    expression: "忘れないように",
    reading: "わすれないように",
    meaning: "So that I don’t forget.",
    grammarTitle: "ように · with a hope in mind",
    grammar:
      "A negative verb followed by ように expresses a goal: “so as not to…” Here the singer wants to keep a sensory memory.",
    vocabulary: [
      { word: "匂い", reading: "におい", meaning: "scent" },
      { word: "忘れる", reading: "わすれる", meaning: "to forget" },
    ],
  },
  {
    start: 122,
    parts: [
      { text: "僕", reading: "ぼく" },
      { text: "らの" },
      { text: "明日", reading: "あした" },
      { text: "は、まだ" },
      { text: "白", reading: "しろ" },
      { text: "いまま。" },
    ],
    translation: "Our tomorrow is still an unwritten page.",
    expression: "白いまま",
    reading: "しろいまま",
    meaning: "Still blank; still unwritten.",
    grammarTitle: "まま · staying as it is",
    grammar:
      "まま follows a description to show that a state remains unchanged. 白いまま literally means “still white,” an image of an unwritten future.",
    vocabulary: [
      { word: "明日", reading: "あした", meaning: "tomorrow" },
      { word: "まま", reading: "まま", meaning: "remaining in a state" },
    ],
  },
  {
    start: 141,
    parts: [
      { text: "立", reading: "た" },
      { text: "ち" },
      { text: "止", reading: "ど" },
      { text: "まっても、" },
      { text: "空", reading: "そら" },
      { text: "は" },
      { text: "続", reading: "つづ" },
      { text: "く。" },
    ],
    translation: "Even when I stop, the sky goes on.",
    expression: "立ち止まっても",
    reading: "たちどまっても",
    meaning: "Even if I stop for a moment.",
    grammarTitle: "ても · the world keeps going",
    grammar:
      "立ち止まる becomes 立ち止まっても: “even if I stop.” The second half contrasts that pause with the endless sky.",
    vocabulary: [
      { word: "立ち止まる", reading: "たちどまる", meaning: "to stop walking" },
      { word: "続く", reading: "つづく", meaning: "to continue" },
    ],
  },
  {
    start: 161,
    parts: [
      { text: "遠回", reading: "とおまわ" },
      { text: "りしても、" },
      { text: "君", reading: "きみ" },
      { text: "に" },
      { text: "会", reading: "あ" },
      { text: "いたい。" },
    ],
    translation: "Even if I take the long way, I want to see you.",
    expression: "遠回りしても",
    reading: "とおまわりしても",
    meaning: "Even if I take the long way.",
    grammarTitle: "ても · even if",
    grammar:
      "Add も to a verb’s て-form to say “even if.” Here, taking a longer route won’t change the wish to see someone.",
    vocabulary: [
      {
        word: "遠回り",
        reading: "とおまわり",
        meaning: "detour; the long way",
      },
      { word: "会いたい", reading: "あいたい", meaning: "want to see someone" },
    ],
  },
  {
    start: 183,
    parts: [
      { text: "新", reading: "あたら" },
      { text: "しい" },
      { text: "朝", reading: "あさ" },
      { text: "を、" },
      { text: "一緒", reading: "いっしょ" },
      { text: "に" },
      { text: "迎", reading: "むか" },
      { text: "えよう。" },
    ],
    translation: "Let’s welcome a new morning together.",
    expression: "一緒に迎えよう",
    reading: "いっしょにむかえよう",
    meaning: "Let’s welcome it together.",
    grammarTitle: "よう · an invitation",
    grammar:
      "迎えよう is the volitional form of 迎える, “to welcome.” It makes a warm invitation: “let’s…”",
    vocabulary: [
      { word: "一緒に", reading: "いっしょに", meaning: "together" },
      { word: "迎える", reading: "むかえる", meaning: "to welcome; greet" },
    ],
  },
  {
    start: 202,
    parts: [
      { text: "この" },
      { text: "歌", reading: "うた" },
      { text: "が、" },
      { text: "君", reading: "きみ" },
      { text: "に" },
      { text: "届", reading: "とど" },
      { text: "きますように。" },
    ],
    translation: "May this song find its way to you.",
    expression: "届きますように",
    reading: "とどきますように",
    meaning: "I hope it reaches you.",
    grammarTitle: "ますように · a quiet wish",
    grammar:
      "The polite form followed by ように can express a wish. Here it is less a statement and more a hope sent out into the night.",
    vocabulary: [
      { word: "届く", reading: "とどく", meaning: "to reach; arrive" },
      { word: "歌", reading: "うた", meaning: "song" },
    ],
  },
]

export const songs = [
  {
    id: "yoru",
    title: "夜の向こう",
    english: "Beyond the Night",
    artist: "haruno",
    genre: "Indie pop",
    color: "gold",
    image: "/images/beyond-the-night.jpg",
    label: "HARUNO",
    sub: "BEYOND THE NIGHT",
  },
  {
    id: "blue",
    title: "青い余白",
    english: "Room for Blue",
    artist: "sora & the sea",
    genre: "Dream pop",
    color: "blue",
    image: "/images/room-for-blue.jpg",
    label: "青い余白",
    sub: "SORA & THE SEA",
  },
  {
    id: "city",
    title: "午前二時",
    english: "2 AM",
    artist: "mizu",
    genre: "City pop",
    color: "red",
    image: "/images/two-am.jpg",
    label: "02:00",
    sub: "MIZU / NIGHT TAPES",
  },
  {
    id: "wind",
    title: "風待ち",
    english: "Waiting for the Wind",
    artist: "komorebi",
    genre: "Acoustic",
    color: "green",
    image: "/images/waiting-for-the-wind.jpg",
    label: "風待ち",
    sub: "KOMOREBI",
  },
]
export type Song = typeof songs[number]
export const heroImage = "/images/tokyo-evening.jpg"
export const formatTime = (time: number) =>
  `${Math.floor(time / 60)}:${Math.floor(time % 60)
    .toString()
    .padStart(2, "0")}`
export const getLine = (time: number) =>
  lyrics.reduce((n, line, i) => (line.start <= time ? i : n), 0)
