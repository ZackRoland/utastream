# Client Skeleton Acceptance — 2026-11-10

**Status:** Client fixture walkthrough complete; formal walking skeleton incomplete  
**Acceptance source:** [UtaStream Walking Skeleton v1](./walking-skeleton-v1.md)  
**Review scope:** The migrated React client in `apps/web`

## Decision

The Figma-derived client skeleton is ready for a walkthrough and code review. It
now demonstrates the complete in-browser fixture journey without coupling the
lyrics or learning surfaces to playback state.

It must not be described as the completed ADR walking skeleton yet. The accepted
product specification explicitly requires a real browser media element, a
FastAPI boundary, generated OpenAPI client types, PostgreSQL persistence, and a
Playwright journey. Those boundaries do not exist in the repository at this
checkpoint.

## Client journey acceptance

| Requirement | Result | Evidence and qualification |
| --- | --- | --- |
| Choose a fixture track through a user action | Pass | `SeededCollection` hands a stable track id to the app-owned playback session. |
| Play, pause, seek, and retain playback state | Pass for fixture clock | Playback state remains owned by `useFixturePlayback`; seeking back from `ended` returns to `paused` and can resume. This is not browser audio. |
| Show versioned, timed Japanese lyrics | Pass | The lyric document and segments have stable ids, start/end bounds, and version data. Boundary, post-track, and timing-gap behavior are covered by tests. |
| Toggle all translations without disrupting Japanese or playback | Pass | The workspace exposes a pressed-state toggle; Japanese, active lyric identity, and playback ownership remain unchanged. |
| Select an expression and an individual kanji | Pass | Both item kinds use keyboard-reachable annotation buttons and the same explanation interaction model. |
| Render the correct fixture explanation | Pass for known fixtures | Expression and kanji fixtures include reading, contextual meaning, explanation, vocabulary, and source sentence context. A missing-fixture recovery state remains absent. |
| Save an item with source context | Pass in memory only | The client snapshot records test user, track, lyric document/version, segment, explanation, selected text, kind, and timestamp. Its composite identity makes repeated saves idempotent for this session. |
| Close the explanation and continue playback | Pass for fixture clock | Playing state advances; paused state remains paused; focus returns to the selected annotation; nested Escape closes only the explanation. |
| Preserve playback when lyrics are unavailable | Pass for fixture state | A visible status explains that lyrics are unavailable while the player remains usable. Network/API recovery states are not implemented. |
| Accessibility baseline for this client | Pass with browser follow-up | Controls have names and visible focus behavior, active lyrics do not rely on color alone, dialogs move and restore focus, and auto-scroll respects reduced motion. A real keyboard Playwright pass is still required. |

## Definition-of-done audit

| # | Walking Skeleton v1 criterion | Result |
| --- | --- | --- |
| 1 | Full local journey from a clean setup without paid accounts | Partial — the deterministic client journey runs locally; the API and database journey does not. |
| 2 | Permitted media and provenance documented | Not met — there is no playable audio fixture or media-provenance record. |
| 3 | Client, API, PostgreSQL, and generated OpenAPI contract participate | Not met — only the client exists. |
| 4 | Expression and kanji fixture explanations open | Met. |
| 5 | A learning item persists idempotently in PostgreSQL | Not met — current state is memory-only. |
| 6 | Playback continuity passes automated browser verification | Partial — React integration tests cover the invariant against the fixture clock; Playwright and real media are absent. |
| 7 | Required unit, integration, contract, client, and end-to-end tests pass | Not met — Python, contract, persistence, and Playwright suites do not exist. |
| 8 | Loading and recoverable failures preserve playback | Partial — the lyrics-unavailable client state preserves playback; API/media/explanation/save failure and retry states are absent. |
| 9 | No paid AI, transcription, translation, or media calls | Met. |
| 10 | Known deviations are documented and approved | Documented here; owner approval remains pending. |

## Known deviations

- Playback is a deterministic React timer rather than a persistent HTML media
  element serving permitted audio bytes.
- Catalog, lyrics, explanations, and saves are local fixtures rather than calls
  through generated OpenAPI types to FastAPI repositories.
- Saves do not survive refresh, a new session, or an API restart because there is
  no PostgreSQL-backed learning module yet.
- The migrated visual collection retains four prototype cards although the
  formal deterministic slice specifies one seeded collection with one permitted
  track. Only `Beyond the Night` completes the learning journey.
- Initial loading, empty collection, track not found, audio failure, lyric fetch
  failure with retry, missing explanation, save validation failure, and temporary
  save failure with retry are not represented.
- There is no Playwright configuration or browser-level acceptance scenario.

## Verification record

Automated checks completed on 2026-11-10 from `apps/web`:

```sh
./node_modules/.bin/tsc -b --pretty false
./node_modules/.bin/vitest run
./node_modules/.bin/tsc -b && ./node_modules/.bin/vite build
```

- TypeScript: passed.
- Vitest: 12 test files and 31 tests passed.
- Production build: passed; 47 modules transformed.
- Desktop browser walkthrough: passed track selection, playback progression,
  translation toggling, expression save, kanji save, nested Escape behavior,
  focus restoration, and continued playback.
- Responsive browser walkthrough: collection, lyric workspace, and explanation
  panel inspected at a true 390 × 844 emulated viewport. Each reported a 390 px
  document width with no horizontal overflow.

The Codex runtime exposed pnpm 11 while this repository pins pnpm 10.34.3, so its
pnpm wrapper attempted an unnecessary dependency reinstall. The equivalent local
binaries above were used without changing dependencies. A developer shell with
the pinned package-manager version should run the normal root commands:

```sh
pnpm typecheck:web
pnpm test:web
pnpm build:web
```

## Required next lifecycle slice

After this client checkpoint is reviewed, the next implementation work should be
the real vertical slice rather than additional Figma migration:

1. Add the FastAPI modular-monolith shell, health/readiness routes, and seeded
   fixture repositories.
2. Add PostgreSQL migrations and the idempotent saved-learning-item boundary.
3. Export OpenAPI and generate the TypeScript client used by `apps/web`.
4. Add a documented permitted audio fixture and replace the timer with one
   persistent browser media element.
5. Add required recovery states and a Playwright journey covering playback,
   lyrics, both selection kinds, persistence, focus, and continuity.

Until those steps pass, this document accepts the client skeleton only and keeps
`walking-skeleton-v1.md` in its existing **Proposed** state.
