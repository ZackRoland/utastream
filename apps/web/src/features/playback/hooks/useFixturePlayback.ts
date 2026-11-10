import { useCallback, useEffect, useReducer } from "react"

import {
  initialPlaybackState,
  playbackReducer,
  type LoadTrackInput,
} from "../model/playback"

type LoadOptions = {
  autoPlay?: boolean
}

export function useFixturePlayback() {
  const [state, dispatch] = useReducer(playbackReducer, initialPlaybackState)

  useEffect(() => {
    if (state.status !== "playing") return

    const timer = window.setInterval(() => {
      dispatch({ type: "tick", seconds: 0.25 })
    }, 250)

    return () => window.clearInterval(timer)
  }, [state.status])

  const load = useCallback((input: LoadTrackInput, options?: LoadOptions) => {
    dispatch({ type: "load", input, autoPlay: options?.autoPlay ?? false })
  }, [])

  const toggle = useCallback(() => dispatch({ type: "toggle" }), [])
  const seek = useCallback(
    (time: number) => dispatch({ type: "seek", time }),
    [],
  )

  return { state, load, toggle, seek }
}
