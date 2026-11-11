import { describe, expect, it } from "vitest"

import {
  createSavedLearningItemId,
  initialLearningCollectionState,
  isLearningItemSaved,
  learningCollectionReducer,
  type SavedLearningItem,
} from "./learningCollection"

const item: SavedLearningItem = {
  id: createSavedLearningItemId({
    testUserId: "fixture-user",
    lyricDocumentId: "lyrics-yoru-ja",
    lyricDocumentVersion: 1,
    explanationId: "explanation-yoru-1",
  }),
  testUserId: "fixture-user",
  trackId: "yoru",
  lyricDocumentId: "lyrics-yoru-ja",
  lyricDocumentVersion: 1,
  segmentId: "yoru-1",
  explanationId: "explanation-yoru-1",
  selectedText: "灯りがともる",
  selectionKind: "expression",
  savedAt: "2026-11-10T00:00:00.000Z",
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
    expect(isLearningItemSaved(duplicate, item.id)).toBe(true)
    expect(
      isLearningItemSaved(
        duplicate,
        createSavedLearningItemId({
          ...item,
          lyricDocumentVersion: 2,
        }),
      ),
    ).toBe(false)
  })
})
