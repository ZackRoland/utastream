import type { YouTubeAvailabilityError } from "./youtubeErrors"
import { mapYouTubePlayerError } from "./youtubeErrors"

const IFRAME_API_SCRIPT_ID = "youtube-iframe-api"
const IFRAME_API_URL = "https://www.youtube.com/iframe_api"

type YouTubePlayerInstance = {
  destroy: () => void
  getDuration: () => number
}

type YouTubePlayerConstructor = new (
  element: HTMLElement,
  options: {
    width: string
    height: string
    videoId: string
    playerVars: {
      autoplay: 0
      controls: 1
      origin: string
      playsinline: 1
    }
    events: {
      onReady: (event: { target: YouTubePlayerInstance }) => void
      onError: (event: { data: number }) => void
    }
  },
) => YouTubePlayerInstance

declare global {
  interface Window {
    YT?: { Player: YouTubePlayerConstructor }
    onYouTubeIframeAPIReady?: () => void
  }
}

export type YouTubePlayerHandle = {
  destroy: () => void
}

export type YouTubePlayerCallbacks = {
  onReady: (durationSeconds: number | null) => void
  onError: (error: YouTubeAvailabilityError) => void
}

let apiPromise: Promise<YouTubePlayerConstructor> | null = null

export async function mountYouTubePlayer(
  element: HTMLElement,
  videoId: string,
  callbacks: YouTubePlayerCallbacks,
): Promise<YouTubePlayerHandle> {
  const Player = await loadYouTubeIframeApi()
  const player = new Player(element, {
    width: "100%",
    height: "100%",
    videoId,
    playerVars: {
      autoplay: 0,
      controls: 1,
      origin: window.location.origin,
      playsinline: 1,
    },
    events: {
      onReady: (event) => {
        const duration = event.target.getDuration()
        callbacks.onReady(
          Number.isFinite(duration) && duration > 0 ? duration : null,
        )
      },
      onError: (event) => callbacks.onError(mapYouTubePlayerError(event.data)),
    },
  })

  return { destroy: () => player.destroy() }
}

function loadYouTubeIframeApi(): Promise<YouTubePlayerConstructor> {
  if (window.YT?.Player) return Promise.resolve(window.YT.Player)
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      apiPromise = null
      reject(new Error("YouTube IFrame API loading timed out."))
    }, 10_000)
    const previousReady = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.()
      window.clearTimeout(timeout)
      if (window.YT?.Player) resolve(window.YT.Player)
      else {
        apiPromise = null
        reject(
          new Error("YouTube IFrame API loaded without a Player constructor."),
        )
      }
    }

    const existing = document.getElementById(IFRAME_API_SCRIPT_ID)
    if (existing) return

    const script = document.createElement("script")
    script.id = IFRAME_API_SCRIPT_ID
    script.src = IFRAME_API_URL
    script.async = true
    script.addEventListener("error", () => {
      window.clearTimeout(timeout)
      apiPromise = null
      reject(new Error("YouTube IFrame API could not be loaded."))
    })
    document.head.append(script)
  })

  return apiPromise
}
