import { createWriteStream } from "node:fs"
import { once } from "node:events"

const outputPath = process.argv[2]

if (!outputPath) {
  throw new Error("Usage: node scripts/generate_fixture_audio.mjs OUTPUT.wav")
}

const sampleRate = 22_050
const durationSeconds = 218
const sampleCount = sampleRate * durationSeconds
const bytesPerSample = 2
const dataSize = sampleCount * bytesPerSample
const output = createWriteStream(outputPath)

function writeHeader() {
  const header = Buffer.alloc(44)
  header.write("RIFF", 0)
  header.writeUInt32LE(36 + dataSize, 4)
  header.write("WAVE", 8)
  header.write("fmt ", 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(1, 22)
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(sampleRate * bytesPerSample, 28)
  header.writeUInt16LE(bytesPerSample, 32)
  header.writeUInt16LE(16, 34)
  header.write("data", 36)
  header.writeUInt32LE(dataSize, 40)
  output.write(header)
}

const chordFrequencies = [
  [220, 261.63, 329.63],
  [174.61, 220, 261.63],
  [196, 246.94, 293.66],
  [164.81, 207.65, 246.94],
]
const melodyRatios = [1, 1.125, 1.25, 1.5, 1.25, 1.125, 1.5, 1.667]

function sampleAt(index) {
  const time = index / sampleRate
  const beat = time * 1.4
  const chord = chordFrequencies[Math.floor(beat / 8) % chordFrequencies.length]
  const fade = Math.min(1, time / 3, (durationSeconds - time) / 4)
  const pulse = 0.65 + 0.35 * Math.sin(Math.PI * (beat % 1)) ** 2
  const pad = chord.reduce(
    (sum, frequency, voice) =>
      sum + Math.sin(2 * Math.PI * frequency * time + voice * 0.7),
    0,
  )
  const melodyFrequency = 220 * melodyRatios[Math.floor(beat) % melodyRatios.length]
  const melodyEnvelope = Math.exp(-3.2 * (beat % 1))
  const melody = Math.sin(2 * Math.PI * melodyFrequency * time) * melodyEnvelope
  const kickPhase = beat % 4
  const kick =
    kickPhase < 0.16
      ? Math.sin(2 * Math.PI * (58 - kickPhase * 90) * time) *
        Math.exp(-22 * kickPhase)
      : 0
  const value = fade * (pad * 0.12 * pulse + melody * 0.15 + kick * 0.14)

  return Math.max(-1, Math.min(1, value))
}

writeHeader()

const samplesPerChunk = 16_384
for (let offset = 0; offset < sampleCount; offset += samplesPerChunk) {
  const length = Math.min(samplesPerChunk, sampleCount - offset)
  const chunk = Buffer.allocUnsafe(length * bytesPerSample)

  for (let index = 0; index < length; index += 1) {
    chunk.writeInt16LE(Math.round(sampleAt(offset + index) * 32_767), index * 2)
  }

  if (!output.write(chunk)) {
    await once(output, "drain")
  }
}

output.end()
await once(output, "finish")
