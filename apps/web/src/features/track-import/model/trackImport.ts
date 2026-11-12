export type ImportSourceKind = "local_file" | "youtube"

export type TrackImportStep =
  | "closed"
  | "choose_source"
  | "review_guidance"
  | "awaiting_source"
  | "confirm_source"
  | "source_confirmed"

export type PlaybackSourceProbe = {
  kind: ImportSourceKind
  externalId: string
  normalizedUrl: string
  durationSeconds: number | null
  availability: "available"
  capabilities: {
    requiresVisiblePlayer: boolean
    supportsSeeking: boolean
    portableAcrossDevices: boolean
  }
  provenance: {
    provider: "youtube"
    inspectedAt: string
  }
}

export type TrackImportState = {
  step: TrackImportStep
  sourceKind: ImportSourceKind | null
  sourceProbe: PlaybackSourceProbe | null
}

export type TrackImportAction =
  | { type: "open" }
  | { type: "select_source"; sourceKind: ImportSourceKind }
  | { type: "continue" }
  | { type: "source_ready"; sourceProbe: PlaybackSourceProbe }
  | { type: "confirm_source" }
  | { type: "replace_source" }
  | { type: "back" }
  | { type: "close" }

export const initialTrackImportState: TrackImportState = {
  step: "closed",
  sourceKind: null,
  sourceProbe: null,
}

export function trackImportReducer(
  state: TrackImportState,
  action: TrackImportAction,
): TrackImportState {
  switch (action.type) {
    case "open":
      return { step: "choose_source", sourceKind: null, sourceProbe: null }
    case "select_source":
      return {
        step: "review_guidance",
        sourceKind: action.sourceKind,
        sourceProbe: null,
      }
    case "continue":
      return state.step === "review_guidance" && state.sourceKind
        ? { ...state, step: "awaiting_source" }
        : state
    case "source_ready":
      return state.step === "awaiting_source" &&
        action.sourceProbe.kind === state.sourceKind
        ? {
            ...state,
            step: "confirm_source",
            sourceProbe: action.sourceProbe,
          }
        : state
    case "confirm_source":
      return state.step === "confirm_source" && state.sourceProbe
        ? { ...state, step: "source_confirmed" }
        : state
    case "replace_source":
      return state.sourceKind
        ? { ...state, step: "awaiting_source", sourceProbe: null }
        : state
    case "back":
      if (state.step === "awaiting_source") {
        return { ...state, step: "review_guidance" }
      }
      if (state.step === "review_guidance") {
        return { step: "choose_source", sourceKind: null, sourceProbe: null }
      }
      if (state.step === "confirm_source") {
        return { ...state, step: "awaiting_source", sourceProbe: null }
      }
      if (state.step === "source_confirmed") {
        return { ...state, step: "confirm_source" }
      }
      return state
    case "close":
      return initialTrackImportState
  }
}
