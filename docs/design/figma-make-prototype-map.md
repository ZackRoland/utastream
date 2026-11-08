# Figma Make prototype map

This diagram describes the snapshot in
`prototypes/figma-make/utastream-2026-10-27/UtaStream music learning prototype (Copy)`.
It shows source dependencies and runtime ownership; it is not the target
production architecture.

```mermaid
flowchart TD
    browser([Browser loads index.html]) --> entry["main.tsx: React entrypoint"]
    entry --> app["App.tsx: application coordinator"]

    subgraph shell ["Application shell and destinations"]
        app --> music["Home, Search, Library"]
        app --> player["Now Playing and mini-player"]
        app --> lyricsUi["LyricsExperience.tsx"]
        app --> profileUi["ProfileHub.tsx"]
        app --> secondary["SecondaryScreen.tsx"]
        app --> returnUi["WordsWorthReturningTo.tsx"]
        profileUi --> secondary
    end

    subgraph behavior ["Prototype behavior hooks"]
        app --> playback["usePlayback.ts"]
        app --> learning["useLearningContinuity.ts"]
        app --> profileNav["useProfileNavigation.ts"]
        app --> swipe["useContentSwipe.ts"]
        app --> atmosphere["useArtworkAtmosphere.ts"]
        lyricsUi --> playback
        lyricsUi --> learning
        profileUi --> profileNav
    end

    subgraph shared ["Shared presentation and fixture model"]
        app --> components["components.tsx"]
        lyricsUi --> components
        profileUi --> components
        secondary --> components
        returnUi --> components
        app --> fixtures["data.ts: songs and timed lyrics"]
        player --> fixtures
        lyricsUi --> fixtures
        components --> fixtures
        app --> styles["index.css: tokens, fonts, responsive UI"]
    end

    subgraph browserState ["Browser-owned prototype state"]
        playback --> clock[("Synthetic playback clock")]
        learning --> storage[(localStorage)]
        app --> storage
        profileNav --> history[("History API")]
        atmosphere --> canvas[("Canvas color sampling")]
        swipe --> events[("Pointer and touch events")]
    end

    subgraph staticFiles ["Static files"]
        fixtures --> images[("Artwork and hero images")]
        styles --> fonts[("Local licensed fonts")]
        components --> favicon[("Logo and favicon SVG")]
    end

    app -.->|"Future replacement"| api["FastAPI and generated contracts"]
    fixtures -.->|"Future replacement"| api
    storage -.->|"Future replacement"| postgres[(PostgreSQL)]

    style shell fill:#C2E5FF,stroke:#3DADFF
    style behavior fill:#DCCCFF,stroke:#874FFF
    style shared fill:#C6FAF6,stroke:#5AD8CC
    style browserState fill:#FFECBD,stroke:#FFC943
    style staticFiles fill:#D9D9D9,stroke:#B3B3B3
    style api fill:#CDF4D3,stroke:#66D575
    style postgres fill:#CDF4D3,stroke:#66D575
```

## How to read it

- `App.tsx` is the prototype's composition root. It coordinates destinations,
  overlays, the current song, favorites, saved expressions, review state,
  preferences, accessibility flags, and dialogs.
- The screen components are mostly presentation layers receiving state and
  callbacks from `App.tsx`; they are not independently routed pages.
- The custom hooks isolate useful interaction experiments, but they still
  operate entirely in the browser.
- `usePlayback.ts` advances a synthetic clock and derives the active lyric from
  fixture timing. It is not yet a real media adapter.
- `data.ts` is both the catalog fixture and lyric-document fixture. Production
  code should replace these imports with application-owned view models backed
  by the API contract.
- `localStorage` currently stands in for user preferences, favorites, saved
  learning items, custom decks, and learning continuity. PostgreSQL will own
  the authoritative persisted records in the walking skeleton.
- The dotted green path marks the main production migration seam rather than
  an existing runtime dependency.

