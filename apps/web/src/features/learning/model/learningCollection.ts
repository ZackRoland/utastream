export type SavedExpression = {
  id: string
  trackId: string
  segmentId: string
  explanationId: string
}

export type LearningCollectionState = {
  items: SavedExpression[]
}

export type LearningCollectionAction = {
  type: "save"
  item: SavedExpression
}

export const initialLearningCollectionState: LearningCollectionState = {
  items: [],
}

export function learningCollectionReducer(
  state: LearningCollectionState,
  action: LearningCollectionAction,
): LearningCollectionState {
  if (state.items.some((item) => item.explanationId === action.item.explanationId)) {
    return state
  }

  return { items: [...state.items, action.item] }
}

export function isExpressionSaved(
  state: LearningCollectionState,
  explanationId: string,
) {
  return state.items.some((item) => item.explanationId === explanationId)
}
