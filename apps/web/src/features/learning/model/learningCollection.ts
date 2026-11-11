export type SavedLearningItem = {
  id: string
  testUserId: string
  trackId: string
  lyricDocumentId: string
  lyricDocumentVersion: number
  segmentId: string
  explanationId: string
  selectedText: string
  selectionKind: "expression" | "kanji"
  savedAt: string
}

export type LearningCollectionState = {
  items: SavedLearningItem[]
}

export type LearningCollectionAction = {
  type: "save"
  item: SavedLearningItem
}

export type SavedLearningItemIdentity = Pick<
  SavedLearningItem,
  "testUserId" | "lyricDocumentId" | "lyricDocumentVersion" | "explanationId"
>

export const initialLearningCollectionState: LearningCollectionState = {
  items: [],
}

export function learningCollectionReducer(
  state: LearningCollectionState,
  action: LearningCollectionAction,
): LearningCollectionState {
  if (state.items.some((item) => item.id === action.item.id)) {
    return state
  }

  return { items: [...state.items, action.item] }
}

export function createSavedLearningItemId({
  testUserId,
  lyricDocumentId,
  lyricDocumentVersion,
  explanationId,
}: SavedLearningItemIdentity) {
  return [
    testUserId,
    lyricDocumentId,
    lyricDocumentVersion,
    explanationId,
  ].join(":")
}

export function isLearningItemSaved(
  state: LearningCollectionState,
  learningItemId: string,
) {
  return state.items.some((item) => item.id === learningItemId)
}
