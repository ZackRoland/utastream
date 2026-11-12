import { useCallback, useEffect, useReducer, useRef } from "react"

import {
  initialPlaybackState,
  playbackReducer,
  type LoadTrackInput,
} from "../model/playback"

type LoadOptions = {
  autoPlay?: boolean
}

export function useAudioPlayback() {
  const [state, dispatch] = useReducer(playbackReducer, initialPlaybackState)
  const mediaRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const media = mediaRef.current
    if (!media) return

    const updateTime = () =>
      dispatch({
        type: "timeupdate",
        currentTime: media.currentTime,
        duration: Number.isFinite(media.duration) ? media.duration : 0,
      })
    const updateMetadata = () => {
      if (Number.isFinite(media.duration) && media.duration > 0) {
        dispatch({ type: "metadata", duration: media.duration })
      }
    }
    const markPlaying = () => dispatch({ type: "play" })
    const markPaused = () => dispatch({ type: "pause" })
    const markEnded = () => dispatch({ type: "ended" })
    const markFailed = () => dispatch({ type: "error" })

    media.addEventListener("durationchange", updateMetadata)
    media.addEventListener("loadedmetadata", updateMetadata)
    media.addEventListener("timeupdate", updateTime)
    media.addEventListener("play", markPlaying)
    media.addEventListener("pause", markPaused)
    media.addEventListener("ended", markEnded)
    media.addEventListener("error", markFailed)

    return () => {
      media.removeEventListener("durationchange", updateMetadata)
      media.removeEventListener("loadedmetadata", updateMetadata)
      media.removeEventListener("timeupdate", updateTime)
      media.removeEventListener("play", markPlaying)
      media.removeEventListener("pause", markPaused)
      media.removeEventListener("ended", markEnded)
      media.removeEventListener("error", markFailed)
      media.pause()
      media.removeAttribute("src")
      media.load()
    }
  }, [])

  const load = useCallback((input: LoadTrackInput, options?: LoadOptions) => {
    const media = mediaRef.current
    if (!media) return

    dispatch({ type: "load", input })
    media.src = input.src
    media.load()

    if (options?.autoPlay) {
      void media.play().catch(() => dispatch({ type: "error" }))
    }
  }, [])

  const toggle = useCallback(() => {
    const media = mediaRef.current
    if (!media || !state.trackId) return

    if (media.ended || state.status === "ended") {
      media.currentTime = 0
    }
    if (media.paused || state.status !== "playing") {
      void media.play().catch(() => dispatch({ type: "error" }))
    } else {
      media.pause()
    }
  }, [state.status, state.trackId])

  const seek = useCallback((time: number) => {
    const media = mediaRef.current
    if (!media) return

    const duration = Number.isFinite(media.duration) ? media.duration : 0
    media.currentTime = clampTime(time, duration)
    dispatch({
      type: "timeupdate",
      currentTime: media.currentTime,
      duration,
    })
  }, [])

  return { state, mediaRef, load, toggle, seek }
}

function clampTime(time: number, duration: number) {
  if (duration <= 0) return Math.max(0, time)
  return Math.min(duration, Math.max(0, time))
}
