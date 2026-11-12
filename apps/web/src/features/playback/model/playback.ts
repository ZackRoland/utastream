export type PlaybackStatus =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "ended"
  | "error"

export type PlaybackState = {
  trackId: string | null
  status: PlaybackStatus
  currentTime: number
  duration: number
}

export type LoadTrackInput = {
  trackId: string
  src: string
  expectedDurationSeconds: number
}

export type PlaybackAction =
  | { type: "load"; input: LoadTrackInput }
  | { type: "metadata"; duration: number }
  | { type: "play" }
  | { type: "pause" }
  | { type: "timeupdate"; currentTime: number; duration: number }
  | { type: "ended" }
  | { type: "error" }

export const initialPlaybackState: PlaybackState = {
  trackId: null,
  status: "idle",
  currentTime: 0,
  duration: 0,
}

function clampTime(time: number, duration: number) {
  return Math.min(duration, Math.max(0, time))
}

export function playbackReducer(
  state: PlaybackState,
  action: PlaybackAction,
): PlaybackState {
  switch (action.type) {
    case "load":
      return {
        trackId: action.input.trackId,
        status: "loading",
        currentTime: 0,
        duration: action.input.expectedDurationSeconds,
      }
    case "metadata":
      return { ...state, duration: action.duration }
    case "play":
      return { ...state, status: "playing" }
    case "pause":
      return state.status === "ended" ? state : { ...state, status: "paused" }
    case "timeupdate": {
      const duration = action.duration > 0 ? action.duration : state.duration
      return {
        ...state,
        currentTime: clampTime(action.currentTime, duration),
        duration,
      }
    }
    case "ended":
      return { ...state, currentTime: state.duration, status: "ended" }
    case "error":
      return { ...state, status: "error" }
  }
}
