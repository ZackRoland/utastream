export type VocabularyEntry = {
  word: string
  reading: string
  meaning: string
}

export type ExpressionExplanation = {
  id: string
  segmentId: string
  version: number
  expression: string
  reading: string
  meaning: string
  grammar: {
    title: string
    body: string
  }
  vocabulary: VocabularyEntry[]
}
