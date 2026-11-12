# Media Import Increment 8 Acceptance

**Status:** Complete — pending owner review  
**Date:** 2026-11-11  
**Scope:** Lyric query, ranking, normalization, and confirmation

## Delivered behavior

- FastAPI owns an identified, bounded LRCLIB search adapter; React does not
  depend on provider payloads or URLs.
- Unicode NFKC, presentation text, punctuation, case, and featured-artist
  variants are normalized without overwriting original metadata.
- Candidate ranking uses the ADR-0008 `35/30/25/10` title, artist, duration,
  and album weights under policy `metadata-v1`.
- Strong candidates are preselected but still require explicit confirmation.
  Ambiguous and weak candidates require manual selection.
- Synchronized LRC is normalized into ordered line segments and retains raw
  provider text, LRCLIB record ID, attribution, rights status, and document
  version 1.
- Confirmation records the score, policy version, lyric version, user timing
  offset, and confirmation timestamp for Increment 9 persistence.

## Acceptance evidence

| Gate | Evidence |
| --- | --- |
| Strong and ambiguous matches are deterministic | Python scoring tests cover a normalized strong match, ambiguous acoustic edition, and weak live/cover mismatch. React tests prove only strong results are preselected. |
| Missing and provider failure states are recoverable | Route and component tests distinguish missing, rate-limited with `Retry-After`, timeout, overload, and general unavailability. Each UI state explicitly leaves playback unaffected. |
| Wrong editions are visible | Qualifier and duration differences generate warnings; ambiguous candidates cannot be confirmed until selected. |
| Timing correction is retained | The confirmation UI accepts a bounded millisecond offset and includes it in the review summary. |
| Provenance is retained | Each result carries LRCLIB provider record ID, attribution, raw lyric fields, matching policy, and an explicit unknown rights-capability status. |
| Timed lyrics are normalized and versioned | LRC parser tests prove stable ordering and end boundaries; candidates expose version 1 normalized segments without mutating provider text. |
| Playback remains independent | Lookup state lives inside the import dialog and never owns or recreates the playback session. Failure copy and tests enforce this behavior. |

## Provider behavior

The implementation follows LRCLIB's current stable v1 search contract. It
identifies UtaStream through `User-Agent`, sends sequential user-triggered
lookups, limits each response to the provider's first 20 results, honors
`Retry-After`, and does not automatically retry throttled requests.

## Deferred by design

- Creating or reusing the canonical track, persisting the versioned lyric
  document and source-to-lyric binding, merging duplicate sources, and restart
  recovery are Increment 9.
- Provider rights remain explicitly unknown; an open API and open server source
  do not establish production lyric reuse rights.
- Chromaprint/AcoustID remains deferred until observed metadata failure rates
  justify its privacy and dependency cost.
