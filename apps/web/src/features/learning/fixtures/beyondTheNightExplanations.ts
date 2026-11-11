import type { ExpressionExplanation } from "../model/expressionExplanation"

const expressionExplanations: Array<
  Omit<ExpressionExplanation, "selectionKind" | "selectedText">
> = [
  {
    id: "explanation-yoru-1", segmentId: "yoru-1", version: 1,
    expression: "灯りがともる", reading: "あかりがともる", meaning: "The lights come on.",
    grammar: { title: "が marks what comes into view", body: "灯りがともる describes lights appearing naturally. が points to the lights as the subject, rather than someone turning them on." },
    vocabulary: [{ word: "灯り", reading: "あかり", meaning: "light; glow" }, { word: "ともる", reading: "ともる", meaning: "to light up" }],
  },
  {
    id: "explanation-yoru-2", segmentId: "yoru-2", version: 1,
    expression: "追いかけた", reading: "おいかけた", meaning: "I chased after it.",
    grammar: { title: "た · looking back", body: "追いかけた is the plain past form of 追いかける, “to chase.” The ending places this moment in a memory." },
    vocabulary: [{ word: "名前", reading: "なまえ", meaning: "name" }, { word: "追いかける", reading: "おいかける", meaning: "to chase after" }],
  },
  {
    id: "explanation-yoru-3", segmentId: "yoru-3", version: 1,
    expression: "小さな勇気", reading: "ちいさなゆうき", meaning: "A little bit of courage.",
    grammar: { title: "小さな · a gentle description", body: "小さな goes directly before a noun. Here it makes courage feel small but precious, like something you can carry." },
    vocabulary: [{ word: "勇気", reading: "ゆうき", meaning: "courage" }, { word: "小さな", reading: "ちいさな", meaning: "little; small" }],
  },
  {
    id: "explanation-yoru-4", segmentId: "yoru-4", version: 1,
    expression: "まだ言えない", reading: "まだいえない", meaning: "I still can’t say it.",
    grammar: { title: "まだ + negative · not yet", body: "言えない is the negative potential form of 言う: “can’t say.” まだ adds “still” or “not yet,” suggesting that someday, you might." },
    vocabulary: [{ word: "言葉", reading: "ことば", meaning: "word; words" }, { word: "言える", reading: "いえる", meaning: "to be able to say" }],
  },
  {
    id: "explanation-yoru-5", segmentId: "yoru-5", version: 1,
    expression: "遠回りしても", reading: "とおまわりしても", meaning: "Even if I take the long way.",
    grammar: { title: "ても · even if", body: "Add も to a verb’s て-form to say “even if.” 遠回りする becomes 遠回りしても. Here, the detour won’t change the wish to see someone." },
    vocabulary: [{ word: "遠回り", reading: "とおまわり", meaning: "detour; the long way" }, { word: "会いたい", reading: "あいたい", meaning: "want to see someone" }],
  },
  {
    id: "explanation-yoru-6", segmentId: "yoru-6", version: 1,
    expression: "笑っている", reading: "わらっている", meaning: "You’re smiling.",
    grammar: { title: "ている · a moment still unfolding", body: "笑う becomes 笑っている. The ている form describes an action happening now, letting the image of that smile linger." },
    vocabulary: [{ word: "向こう", reading: "むこう", meaning: "beyond; the other side" }, { word: "笑う", reading: "わらう", meaning: "to smile; to laugh" }],
  },
  {
    id: "explanation-yoru-7", segmentId: "yoru-7", version: 1,
    expression: "忘れないように", reading: "わすれないように", meaning: "So that I don’t forget.",
    grammar: { title: "ように · with a hope in mind", body: "A negative verb followed by ように expresses a goal: “so as not to…” Here the singer wants to keep a sensory memory." },
    vocabulary: [{ word: "匂い", reading: "におい", meaning: "scent" }, { word: "忘れる", reading: "わすれる", meaning: "to forget" }],
  },
  {
    id: "explanation-yoru-8", segmentId: "yoru-8", version: 1,
    expression: "白いまま", reading: "しろいまま", meaning: "Still blank; still unwritten.",
    grammar: { title: "まま · staying as it is", body: "まま follows a description to show that a state remains unchanged. 白いまま literally means “still white,” an image of an unwritten future." },
    vocabulary: [{ word: "明日", reading: "あした", meaning: "tomorrow" }, { word: "まま", reading: "まま", meaning: "remaining in a state" }],
  },
  {
    id: "explanation-yoru-9", segmentId: "yoru-9", version: 1,
    expression: "立ち止まっても", reading: "たちどまっても", meaning: "Even if I stop for a moment.",
    grammar: { title: "ても · the world keeps going", body: "立ち止まる becomes 立ち止まっても: “even if I stop.” The second half contrasts that pause with the endless sky." },
    vocabulary: [{ word: "立ち止まる", reading: "たちどまる", meaning: "to stop walking" }, { word: "続く", reading: "つづく", meaning: "to continue" }],
  },
  {
    id: "explanation-yoru-10", segmentId: "yoru-10", version: 1,
    expression: "遠回りしても", reading: "とおまわりしても", meaning: "Even if I take the long way.",
    grammar: { title: "ても · even if", body: "Add も to a verb’s て-form to say “even if.” Here, taking a longer route won’t change the wish to see someone." },
    vocabulary: [{ word: "遠回り", reading: "とおまわり", meaning: "detour; the long way" }, { word: "会いたい", reading: "あいたい", meaning: "want to see someone" }],
  },
  {
    id: "explanation-yoru-11", segmentId: "yoru-11", version: 1,
    expression: "一緒に迎えよう", reading: "いっしょにむかえよう", meaning: "Let’s welcome it together.",
    grammar: { title: "よう · an invitation", body: "迎えよう is the volitional form of 迎える, “to welcome.” It makes a warm invitation: “let’s…”" },
    vocabulary: [{ word: "一緒に", reading: "いっしょに", meaning: "together" }, { word: "迎える", reading: "むかえる", meaning: "to welcome; greet" }],
  },
  {
    id: "explanation-yoru-12", segmentId: "yoru-12", version: 1,
    expression: "届きますように", reading: "とどきますように", meaning: "I hope it reaches you.",
    grammar: { title: "ますように · a quiet wish", body: "The polite form followed by ように can express a wish. Here it is less a statement and more a hope sent out into the night." },
    vocabulary: [{ word: "届く", reading: "とどく", meaning: "to reach; arrive" }, { word: "歌", reading: "うた", meaning: "song" }],
  },
]

const kanjiExplanation: ExpressionExplanation = {
  id: "explanation-yoru-kanji-akari",
  segmentId: "yoru-1",
  version: 1,
  selectionKind: "kanji",
  selectedText: "灯",
  expression: "灯",
  reading: "あか",
  meaning: "Light; lamp.",
  grammar: {
    title: "A light in this lyric",
    body: "Here 灯 appears in 灯り and is read あか. The word describes a visible light or glow coming on in the city.",
  },
  vocabulary: [
    { word: "灯り", reading: "あかり", meaning: "light; glow" },
    { word: "灯る", reading: "ともる", meaning: "to be lit; come on" },
  ],
}

export const beyondTheNightExplanations: ExpressionExplanation[] = [
  ...expressionExplanations.map((explanation) => ({
    ...explanation,
    selectionKind: "expression" as const,
    selectedText: explanation.expression,
  })),
  kanjiExplanation,
]
