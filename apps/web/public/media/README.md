# Permitted fixture media

`beyond-the-night-fixture.mp3` is an original, synthetic instrumental fixture
created for UtaStream on 2026-11-11. It contains no third-party samples,
recordings, melodies, lyrics, or other imported material. The fictional title
and artist metadata are project fixtures rather than representations of a real
commercial recording.

The source waveform is reproducible with
`scripts/generate_fixture_audio.mjs`. It was encoded as a mono 64 kbps MP3 with
LAME 3.100 so ordinary browsers can exercise real media loading and playback
without an external service.

The UtaStream project dedicates this generated audio fixture to the public
domain under CC0 1.0. This dedication applies only to the generated audio, not
to third-party software used to create or encode it.

Integrity details:

- Duration: 218 seconds (plus any codec padding reported by a decoder)
- Sample rate: 22,050 Hz
- Channels: mono
- SHA-256: `1a6a7bbdac1d07b99721a7560219444e2c53007176f9d4ab5d5488b502dedc00`

To reproduce the source waveform and encoded asset from the repository root:

```sh
node scripts/generate_fixture_audio.mjs /tmp/beyond-the-night-fixture.wav
lame -b 64 -m m /tmp/beyond-the-night-fixture.wav \
  apps/web/public/media/beyond-the-night-fixture.mp3
shasum -a 256 apps/web/public/media/beyond-the-night-fixture.mp3
```
