export type PlaybackStatus = "idle" | "playing" | "paused" | "ended"

export type PlaybackState = {
  trackId: string | null
  status: PlaybackStatus
  currentTime: number
  duration: number
}

export type LoadTrackInput = {
  trackId: string
  durationSeconds: number
}

export type PlaybackAction =
  | { type: "load"; input: LoadTrackInput; autoPlay: boolean }
  | { type: "toggle" }
  | { type: "seek"; time: number }
  | { type: "tick"; seconds: number }

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
        status: action.autoPlay ? "playing" : "paused",
        currentTime: 0,
        duration: action.input.durationSeconds,
      }
    case "toggle":
      if (!state.trackId) return state
      if (state.status === "ended") {
        return { ...state, status: "playing", currentTime: 0 }
      }
      return {
        ...state,
        status: state.status === "playing" ? "paused" : "playing",
      }
    case "seek": {
      if (!state.trackId) return state
      const currentTime = clampTime(action.time, state.duration)
      return {
        ...state,
        currentTime,
        status: currentTime === state.duration ? "ended" : state.status,
      }
    }
    case "tick": {
      if (state.status !== "playing") return state
      const currentTime = clampTime(
        state.currentTime + action.seconds,
        state.duration,
      )
      return {
        ...state,
        currentTime,
        status: currentTime === state.duration ? "ended" : "playing",
      }
    }
  }
}
