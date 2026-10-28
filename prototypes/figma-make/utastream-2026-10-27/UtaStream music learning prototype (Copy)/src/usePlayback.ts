import { useEffect, useRef, useState } from "react"
import { getLine, lyrics } from "./data"

// A quiet original synth arrangement provides copyright-free prototype audio.
export default function usePlayback() {
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(68)
  const [replayIndex, setReplayIndex] = useState<number | null>(null)
  const [replayComplete, setReplayComplete] = useState(false)
  const liveBookmark = useRef<{
    time: number
    playing: boolean
  } | null>(null)
  const [repeat, setRepeat] = useState(false)
  const [volume, setVolume] = useState(0.55)
  const audio = useRef<AudioContext | null>(null)
  const output = useRef<GainNode | null>(null)
  const chord = useRef(0)
  const [audioReady, setAudioReady] = useState(false)

  function unlockAudio() {
    try {
      if (!audio.current) {
        audio.current = new AudioContext()
        output.current = audio.current.createGain()
        output.current.gain.value = volume * 0.13
        output.current.connect(audio.current.destination)
      }
      void audio.current.resume()
      setAudioReady(true)
    } catch {
      /* Playback remains available when browser audio is unavailable. */
    }
  }

  function play() {
    unlockAudio()
    if (replayComplete && replayIndex !== null) {
      setTime(lyrics[replayIndex].start)
      setReplayComplete(false)
    }
    setPlaying(true)
  }
  function toggle() {
    if (!playing && replayComplete) {
      play()
      return
    }
    unlockAudio()
    setPlaying((value) => !value)
  }
  function seek(value: number) {
    liveBookmark.current = null
    setReplayIndex(null)
    setReplayComplete(false)
    setTime(Math.min(218, Math.max(0, value)))
  }
  function playAt(value: number) {
    seek(value)
    unlockAudio()
    setPlaying(true)
  }
  function replay(index: number) {
    // Keep a separate live-song bookmark; replay never replaces its resume point.
    if (!liveBookmark.current) liveBookmark.current = { time, playing }
    setReplayIndex(index)
    setReplayComplete(false)
    setTime(lyrics[index].start)
    unlockAudio()
    setPlaying(true)
  }
  function returnToLive() {
    const bookmark = liveBookmark.current
    if (bookmark) {
      setTime(bookmark.time)
      setPlaying(bookmark.playing)
    }
    liveBookmark.current = null
    setReplayIndex(null)
    setReplayComplete(false)
  }

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => {
      setTime((old) => {
        const next = old + 0.25
        if (
          replayIndex !== null &&
          next >= (lyrics[replayIndex + 1]?.start ?? 218)
        ) {
          setPlaying(false)
          setReplayComplete(true)
          return (lyrics[replayIndex + 1]?.start ?? 218) - 0.01
        }
        if (next >= 218) {
          if (repeat) return 0
          setPlaying(false)
          return 218
        }
        return Math.min(next, 218)
      })
    }, 250)
    return () => window.clearInterval(timer)
  }, [playing, replayIndex, repeat])

  useEffect(() => {
    if (output.current && audio.current)
      output.current.gain.setTargetAtTime(
        playing ? volume * 0.13 : 0,
        audio.current.currentTime,
        0.12,
      )
  }, [volume, playing, audioReady])

  useEffect(() => {
    if (!playing || !audioReady) return
    const chords = [
      [220, 261.63, 329.63, 493.88],
      [174.61, 220, 261.63, 392],
      [196, 246.94, 293.66, 440],
      [164.81, 196, 246.94, 369.99],
    ]
    const sound = () => {
      const ctx = audio.current
      const master = output.current
      if (!ctx || !master) return
      const notes = chords[chord.current++ % chords.length]
      notes.forEach((frequency, index) => {
        const oscillator = ctx.createOscillator()
        const gain = ctx.createGain()
        oscillator.type = "sine"
        oscillator.frequency.value = frequency
        const start = ctx.currentTime + index * 0.16
        gain.gain.setValueAtTime(0, start)
        gain.gain.linearRampToValueAtTime(0.24, start + 0.4)
        gain.gain.exponentialRampToValueAtTime(0.001, start + 3.6)
        oscillator.connect(gain)
        gain.connect(master)
        oscillator.start(start)
        oscillator.stop(start + 4)
        oscillator.onended = () => {
          oscillator.disconnect()
          gain.disconnect()
        }
      })
    }
    sound()
    const timer = window.setInterval(sound, 3600)
    return () => window.clearInterval(timer)
  }, [playing, audioReady])

  return {
    playing,
    time,
    setTime,
    toggle,
    play,
    playAt,
    seek,
    replay,
    replayIndex,
    replayComplete,
    returnToLive,
    liveTime: liveBookmark.current?.time ?? time,
    songIndex: getLine(liveBookmark.current?.time ?? time),
    liveIndex: getLine(time),
    repeat,
    setRepeat,
    volume,
    setVolume,
  }
}
