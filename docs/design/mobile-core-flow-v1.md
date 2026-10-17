# UtaStream Mobile Experience — Design Brief v2

**Status:** Ready for low-fidelity exploration  
**Product surface:** Mobile-first responsive music application  
**Representative viewport:** 390 × 844 px  
**Core journey:** Familiar music playback with optional, integrated lyric learning  
**Source documents:** [Project manifesto](../adrs/manifesto-v1.md), [ADR-0001](../adrs/0001-use-figma-as-design-source-of-truth.md)

## 1. Product definition

UtaStream is a full music application first. Browsing, selecting a song,
controlling playback, viewing a queue, and moving into lyrics should feel as
familiar and polished as they do in established music products.

Its differentiator is that the synchronized lyric experience contains optional
language-learning tools that ordinary music applications do not provide:
furigana, translation, expression lookup, grammar explanation, sentence replay,
and saving language into decks for later review.

Learning has two distinct contexts:

1. **Inside listening:** Lightweight, contextual help available from
   synchronized lyrics without breaking playback.
2. **Outside listening:** Dedicated decks and review sessions for deliberate
   study, separated from the ordinary music experience.

The product must remain enjoyable and complete when the listener chooses not to
study during a session. Learning must nevertheless be a substantial product
capability, not a decorative feature.

## 2. Primary user and outcome

### Primary user

A Japanese learner of any level who already enjoys Japanese music and wants to
understand lyrics without switching among a music player, lyric website,
dictionary, grammar reference, and flashcard application.

### Core outcome

The listener plays a song normally, scrolls to its lyrics, expands the lyrics,
uses as much or as little language help as desired, saves useful material, and
continues listening. Later, the saved material is available in a dedicated deck
and review area.

### Experience balance

Aim for the manifesto's approximate 70/30 enjoyment-to-education balance in the
general music experience. A deliberate review session may reverse that balance
because the user has explicitly chosen to study.

## 3. Design principles

1. **Music-app behavior is the baseline.** Browsing, track selection, playback,
   queueing, scrubbing, and lyric discovery should follow familiar conventions
   unless learning provides a clear reason to diverge.
2. **Listening stays continuous.** Opening lyrics or contextual explanations
   does not pause playback unless the listener chooses to pause or replay a
   segment.
3. **Learning is invited, not imposed.** No lesson, placement test, streak, or
   review is required before playing music. Streaks and daily review may support
   motivated learners, but never gate listening or punish absence.
4. **Progressive disclosure.** Start with Japanese lyrics, then optional
   furigana and translation, then contextual grammar and vocabulary details.
5. **Return is effortless.** Closing a learning surface restores the same song,
   playback position, and lyric context.
6. **Japanese remains primary.** Reading and translation support the original
   lyric rather than visually replacing it.
7. **Context beats dictionary density.** Explain an expression as it is used in
   the current lyric before showing exhaustive reference information.
8. **Study has its own home.** Decks and reviews are persistent first-class
   destinations, not interruptions inserted into ordinary playback.
9. **Trust is visible.** Source, translation confidence, and alternate
   interpretations are distinguishable where relevant.

## 4. Application information architecture

| Destination | Primary purpose |
| --- | --- |
| Home | Continue listening, recently played, and music recommendations |
| Search | Find songs, artists, albums, or imported content |
| Library | Saved songs, albums, playlists, and user-provided music |
| Profile hub | Identity plus secondary destinations such as Settings, Decks, Review, and Recents |

The persistent “home island” should stay focused on primary music navigation.
Decks and Review remain substantial product areas, but they are reached through
the Profile hub rather than occupying the limited primary navigation space.

### Profile-hub gesture

On root-level main screens, a rightward swipe across the main content surface
may reveal the Profile hub. The transition should make the hub feel like a
secondary layer beside the music application rather than a replacement page.

- Keep a visible avatar/profile control as the discoverable and accessible
  alternative; the gesture must never be the only route.
- Do not intercept the operating system or browser's edge-swipe Back gesture.
- Activate only from an eligible root screen and a deliberate horizontal
  gesture, not while interacting with a carousel, lyric scrubber, or horizontal
  control.
- Disable the gesture on nested screens where rightward navigation means Back.
- Support closing by swiping left, activating Close, selecting a destination,
  or using the platform Back action.
- Respect reduced-motion preferences and keep focus management correct when the
  hub opens as an overlay/drawer.

The Profile hub should contain at minimum: Profile summary, Settings, Decks and
Review, Recents/listening history, language-display preferences, playback and
accessibility preferences, account controls, and help/about information.

## 5. Primary listening-to-learning flow

```text
Home, Search, or Library
  → Select a song
  → Conventional Now Playing
  → Scroll down to synchronized lyric preview
  → Expand lyrics to full screen
  → Optionally toggle translation or furigana
  → Select a line, phrase, or expression
  → View contextual translation and grammar
  → Optionally replay the sentence
  → Save useful language to a deck
  → Dismiss learning detail and continue listening
```

### Success condition

The user can play and control a song without encountering mandatory study UI.
They can then discover the lyrics, understand and save one expression, and
return to ordinary playback without losing position or orientation.

### Prototype starting state

Start from a populated Home or collection screen, not onboarding or music
ingestion. Authentication, permissions, and source preparation may be assumed
for this test so the prototype can validate normal music behavior first.

## 6. Primary screen list

### M01 — Home / Music discovery

**Purpose:** Establish UtaStream as a credible music product.

**Required content**

- Continue listening
- Recently played or saved music
- One small recommendation or featured section
- Song, album, and artist presentation
- Persistent navigation to Search, Library, Review, and Profile
- Persistent mini-player once playback has started

**Avoid:** Making every heading about study, displaying guilt-driven review
metrics prominently, or explaining learning features before music is chosen.

### M02 — Album, playlist, or library collection

**Purpose:** Validate familiar browsing and song-selection behavior.

**Required content**

- Collection artwork, title, artist/creator, and metadata
- Play and shuffle actions where appropriate
- Familiar track list with per-track overflow actions
- Saved, downloaded, or readiness indicators where relevant
- Secondary route to add user-provided music

**Behavior:** Tapping a track begins playback and opens M03 in the manner users
expect from established music applications.

### M03 — Now Playing / Default

**Purpose:** Provide a complete standard playback experience before asking the
user to learn anything.

**Required content**

- Artwork, title, artist, and collection context
- Play/pause, previous, next, seek, shuffle, and repeat where appropriate
- Queue, output/device, save, and overflow access
- Vertically scrollable content below the primary player
- Embedded synchronized-lyrics preview lower on the page
- No mandatory grammar, deck, or review controls above the lyrics

### M04 — Embedded lyrics preview

**Purpose:** Make synchronized lyrics a natural extension of Now Playing.

**Required content**

- Active Japanese lyric with neighboring lines
- Clear synchronization with playback
- A clear affordance to expand the panel
- Compact indication of active furigana and translation preferences

**Behavior:** Tapping the preview opens M05 without changing playback position.

### M05 — Full-screen synchronized lyrics

**Purpose:** Provide immersive lyric following and the gateway to optional
learning.

**Required content**

- Compact playback context and controls
- Active line, past lines, and upcoming lines with distinct states
- Translation toggle
- Furigana toggle, initialized from the user's Profile preference
- Calm indication that lyrics or expressions are selectable
- Collapse action returning to the Now Playing scroll position
- Entry to an explicit focused sentence-learning mode

**Behavior**

- Lyrics follow playback precisely.
- Manual scrolling temporarily suspends auto-centering and exposes `Return to current lyric`.
- Selecting a line or expression opens the chosen learning treatment.
- Opening an explanation does not automatically pause playback.

### M06 — Contextual lyric explanation

**Purpose:** Answer “what does this mean here?” while retaining song context.

**Required content**

- Selected Japanese expression and reading
- Full lyric sentence
- Contextual translation
- Concise grammar explanation
- Optional vocabulary details and alternate meaning
- Replay-current-sentence action
- Save-to-deck action
- Close/collapse action

### M07 — Saved confirmation / Return to listening

**Purpose:** Confirm the learning action without creating a new task.

Saving should update inline, show a brief non-blocking confirmation, and remain
on the current lyric. `View deck` may be offered, but must not navigate away
automatically.

### M08 — Review / Deck overview

**Purpose:** Establish that saved language becomes useful later without
interrupting music listening.

**Required content**

- Song-based and user-created decks
- Due and new-card counts without guilt-oriented copy
- Start-review action
- Recent saves
- Visible connection from each item back to its source song and lyric

The complete review interaction is a separate prototype flow. It should be
reachable from the Profile hub rather than permanently occupying the home
island.

### M09 — Profile hub / Secondary navigation

**Purpose:** Provide a consistent secondary layer for identity, learning, history,
and configuration without crowding primary music navigation.

**Required content**

- Profile identity and account summary
- Decks and Review destination
- Recents/listening-history destination
- Settings destination
- Default furigana behavior: on, off, or adaptive
- Default translation behavior
- Preferred explanation depth or learner level, if supported
- Playback and accessibility preferences
- Explanation that in-player toggles temporarily override defaults

**Entry behavior:** Open from the visible profile/avatar control or a deliberate
rightward swipe on eligible root screens. Both routes must produce the same hub
state and preserve the underlying screen and playback state.

Furigana may initially default on, while still making Profile the durable place
to customize that behavior.

## 7. Lyric-window concepts to prototype

Use the same song, lyric, playback position, and task in each concept so the
tradeoffs can be compared fairly.

### Concept A — Lyrics-first with contextual bottom sheet

- Full-screen synchronized lyrics remain visually dominant.
- Tapping a line or expression opens translation, grammar, replay, and save
  actions in a draggable bottom sheet.
- Playback continues and part of the lyric surface remains visible.
- Strong candidate for lightweight, in-the-moment learning.

### Concept B — Focused sentence mode

- Enter explicitly from full-screen lyrics; never activate automatically.
- Show one lyric sentence or phrase at a time.
- Include Japanese, furigana, optional translation, grammar, and vocabulary.
- Provide replay-current-segment, previous-segment, next-segment, and return-to-live-lyrics actions.
- Clearly distinguish following live playback from inspecting an earlier line.
- This is the most direct mobile adaptation of the hackathon desktop concept.

### Concept C — Swipeable lyric cards with expandable analysis

- Each synchronized sentence occupies a vertically or horizontally paged card.
- Translation can appear inline; deeper grammar and vocabulary expand on demand.
- Segment replay and navigation remain thumb-accessible.
- Test carefully: paging cannot make ordinary lyric following feel like a
  mandatory lesson.

### Larger-screen adaptation

Tablet and desktop can use a two-pane focused mode: synchronized lyric/sentence
navigation on one side and translation, grammar, and vocabulary analysis on the
other. Mobile should use layers, progressive disclosure, or an explicit focused
mode rather than compressing two desktop panes side by side.

## 8. Supporting acquisition flow

Adding user-provided music remains necessary but is not the primary playback
prototype:

```text
Library add action
  → Choose pasted link or local file
  → Confirm source and rights-aware guidance
  → Prepare metadata, lyrics, readings, and translation
  → Song becomes ready in Library
```

The design should eventually cover staged progress, background processing,
readiness, cancellation, and recoverable errors. Do not let this supporting
flow replace the music-player experience in the first prototype.

## 9. Required component inventory

- Mobile navigation and top bar
- Mini-player and full player controls
- Playback scrubber
- Song, album, artist, and collection cards/rows
- Embedded lyrics-preview panel
- Lyric line: upcoming, active, past, selected, and saved-expression states
- Furigana and translation toggles
- Return-to-current-lyric control
- Contextual bottom sheet
- Segment replay, previous-segment, and next-segment controls
- Expression detail and grammar blocks
- Save-to-deck control and confirmation
- Deck summary card
- Profile setting row and preference control
- Profile-hub drawer/overlay with open, closing, and nested-navigation states
- Loading, buffering, empty, unavailable, and error treatments

Build only the foundations and components demonstrated by these flows. Do not
create a comprehensive design system before reuse is proven.

## 10. State matrix

| Surface | Minimum states to design |
| --- | --- |
| Song row | ready, playing, preparing, unavailable |
| Player | loading, playing, paused, buffering, playback error |
| Lyrics surface | embedded, expanded, manually scrolled, following live playback, focused mode |
| Lyric line | upcoming, active, past, selected, contains saved expression |
| Furigana/translation | off, on, adaptive/unavailable |
| Segment playback | live, replaying selection, paused on selection, returning live |
| Expression save | unsaved, saving, saved, failed |
| Bottom sheet | closed, partial, expanded, overflow content |
| Deck | new, due, complete for now, empty |
| Profile hub | closed, gesture-tracking, open, nested destination, closing |

## 11. Prototype content

Use realistic Japanese rather than Latin placeholder text. Until licensing is
confirmed, use original, commissioned, public-domain, or otherwise authorized
sample music, lyrics, and artwork.

The sample should include:

- Kanji that benefits from furigana
- At least one inflected verb and contextual expression
- A sentence that wraps at 360 px
- A concise translation and grammar explanation
- A meaningful segment boundary for replay testing
- One alternate or uncertain interpretation to test trust language

## 12. Visual-direction criteria

- Immersive and music-led, not classroom-themed
- Credible as a music product before learning controls are noticed
- Calm enough for sustained lyric reading
- Strong Japanese/Latin typographic hierarchy
- High contrast without depending on pure black and white everywhere
- Album art may shape atmosphere without reducing lyric legibility
- Learning accents feel integrated, not gamified by default
- Original identity; do not visually clone Spotify, Apple Music, or Duolingo

### Brand direction — contemporary woodblock ocean

Use *The Great Wave off Kanagawa* and broader Japanese woodblock printmaking as
an atmospheric reference, not as a literal background pasted behind a Spotify
layout. Build an original UtaStream identity from:

- Deep indigo and blue-black foundations
- Warm paper, foam, and mist neutrals instead of stark white
- Restrained vermilion or coral accents for learning actions and active states
- Layered wave contours, asymmetrical framing, and rhythmic curved motion
- Subtle print grain, imperfect edges, or carved-line texture at display scale
- Album-art color extraction that remains compatible with the core palette

Avoid decorative stereotypes, direct copies of Hokusai compositions, excessive
ornament around reading text, or textures that obscure Japanese character
strokes. The result should feel contemporary and ownable rather than themed.

### Typography direction

Separate expressive brand typography from instructional lyric typography.

- Use a highly legible Japanese sans serif for lyrics, explanations, controls,
  and furigana. Test `BIZ UDPGothic` first and `Noto Sans JP` as the neutral
  fallback.
- Use an expressive Japanese serif or display face only for brand moments,
  collection headings, or large decorative text—not moving lyrics or furigana.
- Keep the active lyric at regular or medium weight; avoid very heavy weights
  that close counters or merge complex strokes.
- Give lyric Japanese generous line height and letter spacing appropriate to
  the selected face. Furigana must remain readable without crowding adjacent
  lines.
- Validate representative kanji, kana, punctuation, numerals, and mixed Latin
  artist names before approving a type system.

`BIZ UDPGothic` is preferred for the learning surface because it was designed
as a universal-design typeface for legibility and accurate information display.

### First-generation review findings

The initial Make prototype successfully validated the music-app shell, embedded
lyrics, expandable lyrics, optional translation/furigana, and separation of
Review from listening. The next iteration should address:

1. **Differentiate the identity.** The first result reads too closely as a
   Spotify visual clone. Preserve familiar interaction patterns while replacing
   the visual language with the contemporary woodblock-ocean direction.
2. **Restore the intended 70/30 balance.** The first result feels closer to
   90/10 music-to-learning. Keep general browsing music-first, but make the
   expanded lyric surface clearly capable of translation, grammar, sentence
   replay, expression selection, and saving.
3. **Preserve lyric context on expansion.** Expanding the embedded lyric panel
   should promote the currently visible lyric into place rather than animate a
   long scroll down to it. A brief spatial transition is acceptable; the active
   line should remain perceptually anchored.
4. **Differentiate replay from live playback.** Focused sentence replay needs a
   persistent, unmistakable state such as `Studying line 8 · Live song at 1:42`,
   with explicit `Return to live` behavior.
5. **Treat save behavior as product logic.** The prototype only needs a clear
   UI contract for saving; deck selection, deduplication, persistence, and card
   generation will be specified during product and engineering design.

### Cross-prototype synthesis

The earlier desktop concept and current mobile concept should not be merged by
averaging every screen. Assign each prototype's strongest qualities to the
surfaces where they belong.

**Preserve from the mobile prototype**

- Immersive, emotionally led music discovery
- Familiar browsing, mini-player, Now Playing, and embedded lyric behavior
- Restraint on primary listening surfaces
- Full-screen lyrics as the main bridge into learning
- Compact navigation and album-art-led atmosphere

**Carry forward from the desktop concept**

- Clear learning continuity and a sense that saved language leads somewhere
- Editorial warmth in headings and supporting copy
- “Continue learning” and “review when ready” language without pressure
- Visible connection among a song, its saved expressions, and its deck
- Learner-aware curation and progress, used selectively rather than on every song
- Stronger information hierarchy within Decks, Review, Profile, and focused lyrics

**Hybrid allocation**

- Home remains approximately 80/20 music-to-learning above the fold, then lands
  closer to the intended 70/30 balance across the complete scroll.
- Add one compact `Your learning pulse` or `Words worth returning to` module to
  Home after the first music-led sections, never before the primary music hero.
- That module may include a daily review, current streak, and study-activity
  heat map when presented as optional reflection rather than obligation.
- Song and album cards remain music-first. Learning metadata such as saved-word
  count, lyric readiness, or level fit appears only when useful and should not
  resemble a course badge system.
- Now Playing stays approximately 90/10 until the listener reaches lyrics.
- Expanded lyrics may move toward 60/40 because entering that surface is an
  intentional signal of interest in the words.
- Focused sentence mode, Decks, and Review may be learning-dominant because the
  user explicitly chose them.
- Bring the desktop concept's typography, encouragement, progress summaries,
  and song-to-deck continuity into secondary learning surfaces—not its permanent
  desktop sidebar or dashboard density.

**Healthy progress mechanics**

- A streak celebrates consistency but does not erase broader progress when a
  day is missed.
- Missed days remain neutral empty cells rather than failures or warnings.
- A study heat map includes an accessible non-color summary and clearly defines
  which listening, saving, or review actions count as study activity.
- Daily review shows an estimated duration and can be postponed or skipped.
- Listening remains fully available regardless of review status.

The result should feel like one product changing emphasis with user intent:
music while browsing and listening, balanced support in lyrics, and deliberate
learning only after the user chooses it.

## 13. Accessibility and responsive requirements

- Validate at 360 × 800 px and 390 × 844 px.
- Validate representative notched and Dynamic Island devices in addition to a
  rectangular viewport.
- Keep every top-bar control below the device safe area. In production, derive
  top spacing from `env(safe-area-inset-top)` plus a deliberate visual gap. In
  simulated device previews where the environment inset resolves to zero, use
  an explicit mobile prototype fallback (for example,
  `max(env(safe-area-inset-top, 0px), 48px)`) so the hardware overlay cannot
  cover the header.
- Treat the top bar as leading and trailing safe zones with the sensor/camera
  region left unobstructed. The logo must never extend beneath a notch or
  Dynamic Island.
- Allow the wordmark to switch to a compact brand mark at constrained widths;
  never clip, mask, or shrink the full wordmark until it becomes illegible.
- Keep notification and account controls fully inside the trailing safe zone
  with adequate separation from each other and the screen edge.
- Keep interactive targets at least 44 × 44 CSS pixels where practical.
- Do not encode playback or lyric state using color alone.
- Support dynamic text without hiding playback, replay, or close controls.
- Preserve readable Japanese line height and enough space for furigana.
- Do not require precise word selection while the lyrics are moving.
- Make the difference between live playback and sentence replay unmistakable.
- Treat animation as enhancement and respect reduced-motion preferences.
- Annotate player, scrubber, sheet, toggle, selection, and replay semantics for
  production accessibility.

### Mobile top-bar geometry

Use these as responsive intent rather than fixed implementation measurements:

- Top inset: device safe-area inset plus approximately 10–16 px breathing room
- Horizontal inset: approximately 20–24 px
- Content row: at least 44–48 px tall after the safe-area inset
- Leading zone: brand symbol or width-constrained wordmark
- Center exclusion zone: no essential content beneath camera/sensor hardware
- Trailing zone: notification and account actions with 44 px touch targets

The header should remain visually balanced on devices without a notch. Scroll
behavior may condense the header only after its initial safe-area position is
correct, and essential controls must never be cropped during that transition.

## 14. Figma file structure

```text
00 Cover
01 Information Architecture
02 Primary Flow
03 Lyric Concepts A–C
04 Review Flow
05 Supporting Acquisition Flow
06 Foundations — exploratory
07 Components — demonstrated only
08 Approved Screens
09 Prototypes
99 Archive
```

### Frame naming

```text
M01 Home / Default
M02 Album / Track list
M03 Player / Playing
M04 Lyrics preview / Active line
M05 Lyrics / Full screen
M05 Lyrics / Furigana on
M05 Lyrics / Translation on
M06 Learning A / Context sheet
M06 Learning B / Focused sentence
M06 Learning C / Lyric cards
M07 Expression / Saved
M08 Review / Deck overview
M09 Profile hub / Default
M09 Profile hub / Gesture open
M09 Profile hub / Secondary destinations
```

Exploration must be visually separated from approved work. Use Auto Layout and
reusable components once repetition is demonstrated.

## 15. Prototype test tasks

1. “Choose this Japanese song and begin listening.”
2. “Find the lyrics without entering a lesson.”
3. “Expand the lyrics and turn on the language help you prefer.”
4. “Replay this sentence and find out what the highlighted expression means.”
5. “Save that expression for later.”
6. “Return to ordinary listening.”
7. “Show where you would later review what you saved.”

Observe whether:

- The product is recognized as a music application first.
- Track selection and Now Playing match existing expectations.
- Lyrics feel embedded in the player rather than like a separate course.
- Furigana and translation controls are understandable but unobtrusive.
- Sentence replay makes the live playback position clear.
- The explanation is sufficient without becoming overwhelming.
- The user can return to the song without losing orientation.
- Review feels substantial and available without pressuring the listener.
- Concept A, B, or C best balances listening and deliberate study.

## 16. Decisions intentionally left open

1. Does the proof of concept support pasted links, local files, or both?
2. What media and lyric content may UtaStream legally store or process?
3. How are synchronized lyrics sourced, corrected, and attributed?
4. Is selectable text line-, phrase-, token-, or hybrid-based?
5. Is adaptive furigana based on learner level, saved vocabulary, kanji
   familiarity, or only manual preference?
6. Which explanations are authored, sourced, or generated, and how is
   provenance shown?
7. Does saving require an account in the first release?
8. Which lyric concept is the default lightweight interaction, and which is an
   explicitly entered study mode?
9. Does replay loop the main song timeline or use an isolated segment, and how
   does the user return to the live position?
10. How are decks created: automatically by song, explicitly by the user, or
    both?

These questions should be exposed by wireframes rather than silently settled.
They must be resolved before high-fidelity work is implementation-ready.

## 17. Ready-for-generation checklist

- The music-first definition and application architecture are accepted.
- Now Playing scrolls to an embedded lyrics preview that expands full screen.
- Furigana may default on and remains customizable in Profile.
- Decks and Review appear in the product architecture but use a separate flow.
- Concepts A, B, and C will use identical content and playback state.
- A lawful sample song and lyric strategy is selected.
- Lyric-selection granularity and segment-replay behavior are chosen
  provisionally for prototyping.

