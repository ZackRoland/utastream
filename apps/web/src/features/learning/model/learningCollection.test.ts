import { describe, expect, it } from "vitest"

import {
  initialLearningCollectionState,
  isExpressionSaved,
  learningCollectionReducer,
  type SavedExpression,
} from "./learningCollection"

const item: SavedExpression = {
  id: "yoru:yoru-1",
  trackId: "yoru",
  segmentId: "yoru-1",
  explanationId: "explanation-yoru-1",
}

describe("learningCollectionReducer", () => {
  it("saves an expression and ignores duplicate save commands", () => {
    const saved = learningCollectionReducer(initialLearningCollectionState, {
      type: "save",
      item,
    })
    const duplicate = learningCollectionReducer(saved, { type: "save", item })

    expect(saved.items).toEqual([item])
    expect(duplicate).toBe(saved)
    expect(isExpressionSaved(duplicate, item.explanationId)).toBe(true)
  })
})
