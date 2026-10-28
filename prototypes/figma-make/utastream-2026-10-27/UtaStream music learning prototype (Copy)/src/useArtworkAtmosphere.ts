import { useEffect, useState, type CSSProperties } from "react"

export default function useArtworkAtmosphere(image: string) {
  const [palette, setPalette] = useState<CSSProperties>({})
  useEffect(() => {
    let active = true
    const artwork = new Image()
    artwork.onload = () => {
      if (!active) return
      const canvas = document.createElement("canvas")
      canvas.width = canvas.height = 12
      const context = canvas.getContext("2d")
      if (!context) return
      context.drawImage(artwork, 0, 0, 12, 12)
      const pixels = context.getImageData(0, 0, 12, 12).data
      const average = [0, 0, 0]
      for (let i = 0; i < pixels.length; i += 4) {
        average.forEach((_, channel) => {
          average[channel] += pixels[i + channel] / 144
        })
      }
      // A restrained extraction: the record contributes warmth, the indigo remains.
      const blend = (base: number[], amount: number) =>
        base
          .map((value, channel) =>
            Math.round(value * (1 - amount) + average[channel] * amount),
          )
          .join(" ")
      setPalette({
        "--album-ink": `rgb(${blend([13, 25, 45], 0.14)})`,
        "--album-wash": `rgb(${blend([31, 53, 77], 0.25)})`,
      } as CSSProperties)
    }
    artwork.src = image
    return () => {
      active = false
    }
  }, [image])
  return palette
}
