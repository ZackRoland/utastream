export type ImportSourceKind = "local_file" | "youtube"

export type TrackImportStep =
  | "closed"
  | "choose_source"
  | "review_guidance"
  | "awaiting_source"

export type TrackImportState = {
  step: TrackImportStep
  sourceKind: ImportSourceKind | null
}

export type TrackImportAction =
  | { type: "open" }
  | { type: "select_source"; sourceKind: ImportSourceKind }
  | { type: "continue" }
  | { type: "back" }
  | { type: "close" }

export const initialTrackImportState: TrackImportState = {
  step: "closed",
  sourceKind: null,
}

export function trackImportReducer(
  state: TrackImportState,
  action: TrackImportAction,
): TrackImportState {
  switch (action.type) {
    case "open":
      return { step: "choose_source", sourceKind: null }
    case "select_source":
      return { step: "review_guidance", sourceKind: action.sourceKind }
    case "continue":
      return state.step === "review_guidance" && state.sourceKind
        ? { ...state, step: "awaiting_source" }
        : state
    case "back":
      if (state.step === "awaiting_source") {
        return { ...state, step: "review_guidance" }
      }
      if (state.step === "review_guidance") {
        return { step: "choose_source", sourceKind: null }
      }
      return state
    case "close":
      return initialTrackImportState
  }
}
