import { useCallback, useEffect, useState } from "react"
import type { SavedExpression } from "./LyricsExperience"

export type StudyBookmark = {
  songId: string
  index: number
  mode: "B" | "C"
}
export type LearningPreferences = {
  discovery: "balanced" | "familiar" | "new"
  focusedTranslation: boolean
}
export type ReviewBookmark = {
  deck: string
  keys: string[]
  cursor: number
}
export type ReviewMemory = Record<string, "returning" | "familiar">
export const expressionKey = (item: SavedExpression) =>
  `${item.songId}:${item.index}`

function load<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback
  } catch {
    return fallback
  }
}

// Device-local prototype continuity, not a scheduling or card-generation engine.
export default function useLearningContinuity() {
  const [study, setStudy] = useState<StudyBookmark | null>(() =>
    load("uta-study-place", null),
  )
  const [review, setReview] = useState<ReviewBookmark | null>(() =>
    load("uta-review-place", null),
  )
  const [memory, setMemory] = useState<ReviewMemory>(() =>
    load("uta-review-memory", {}),
  )
  const [preferences, setPreferences] = useState<LearningPreferences>(() =>
    load("uta-learning-preferences", {
      discovery: "balanced",
      focusedTranslation: true,
    }),
  )

  useEffect(() => {
    localStorage.setItem("uta-study-place", JSON.stringify(study))
  }, [study])
  useEffect(() => {
    localStorage.setItem("uta-review-place", JSON.stringify(review))
  }, [review])
  useEffect(() => {
    localStorage.setItem("uta-review-memory", JSON.stringify(memory))
  }, [memory])
  useEffect(() => {
    localStorage.setItem(
      "uta-learning-preferences",
      JSON.stringify(preferences),
    )
  }, [preferences])

  const rememberStudy = useCallback((next: StudyBookmark) => {
    setStudy((previous) =>
      previous?.songId === next.songId &&
      previous.index === next.index &&
      previous.mode === next.mode
        ? previous
        : next,
    )
  }, [])
  const rememberReview = useCallback(
    (item: SavedExpression, outcome: "returning" | "familiar") => {
      setMemory((previous) => ({ ...previous, [expressionKey(item)]: outcome }))
    },
    [],
  )
  const counts = (items: SavedExpression[]) =>
    items.reduce(
      (total, item) => {
        const state = memory[expressionKey(item)]
        if (state === "familiar") total.familiar++
        else if (state === "returning") total.due++
        else total.new++
        return total
      },
      { due: 0, new: 0, familiar: 0 },
    )

  return {
    study,
    rememberStudy,
    review,
    setReview,
    memory,
    rememberReview,
    preferences,
    setPreferences,
    counts,
  }
}
