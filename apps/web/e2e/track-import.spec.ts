import { expect, test, type Page } from "@playwright/test"

const candidate = {
  providerRecordId: "42",
  title: "Beyond the Night",
  artist: "Uta",
  album: "Blue",
  durationSeconds: 218,
  durationDifferenceSeconds: 0,
  instrumental: false,
  plainLyrics: "夜の向こう",
  syncedLyrics: "[00:01.00] 夜の向こう",
  lyricDocumentVersion: 1,
  timingType: "line",
  normalizedSegments: [
    { startSeconds: 1, endSeconds: null, text: "夜の向こう" },
  ],
  rightsCapabilities: {
    status: "unknown",
    display: true,
    timedSynchronization: true,
  },
  score: 98,
  confidenceBand: "strong",
  warnings: [],
  matchingPolicyVersion: "metadata-v1",
  sourceProvider: "lrclib",
  attribution: "Lyrics supplied by LRCLIB",
}

async function mockApplicationApi(
  page: Page,
  candidates = [candidate],
) {
  await page.route("**/api/v1/users/*/library", (route) =>
    route.fulfill({ json: { items: [] } }),
  )
  await page.route("**/api/v1/lyrics/candidates?*", (route) =>
    route.fulfill({
      json: { status: "ready", candidates, retryAfterSeconds: null },
    }),
  )
  await page.route("**/api/v1/youtube/metadata?*", (route) =>
    route.fulfill({
      json: {
        status: "ready",
        title: "Beyond the Night",
        artist: "Uta",
        providerTitle: "Beyond the Night",
        providerAuthor: "Uta - Topic",
      },
    }),
  )
  await page.route("**/api/v1/track-imports", async (route) => {
    const request = route.request().postDataJSON()
    const source = request.source
    await route.fulfill({
      json: {
        item: {
          libraryItemId: "00000000-0000-0000-0000-000000000010",
          trackId: "00000000-0000-0000-0000-000000000020",
          title: request.title,
          artist: request.artist,
          album: request.album,
          durationSeconds: source.durationSeconds,
          preferredSourceId: "00000000-0000-0000-0000-000000000030",
          sources: [{
            id: "00000000-0000-0000-0000-000000000030",
            kind: source.kind,
            availability: source.availability,
            externalId: source.externalId,
            normalizedUrl: source.normalizedUrl,
            durationSeconds: source.durationSeconds,
            capabilities: source.capabilities,
          }],
          lyrics: {
            id: "00000000-0000-0000-0000-000000000040",
            bindingId: "00000000-0000-0000-0000-000000000050",
            playbackSourceId: "00000000-0000-0000-0000-000000000030",
            version: 1,
            language: "ja",
            timingType: "line",
            segments: candidate.normalizedSegments,
            sourceProvider: candidate.sourceProvider,
            sourceRecordId: candidate.providerRecordId,
            attribution: candidate.attribution,
            rightsCapabilities: candidate.rightsCapabilities,
            timingOffsetMs: request.lyrics.timingOffsetMs,
          },
        },
        trackCreated: true,
        sourceCreated: true,
        libraryItemCreated: true,
      },
    })
  })
}

async function finishLyrics(
  page: Page,
  metadata?: { title: string; artist: string },
) {
  await page.getByRole("button", { name: "Use this source" }).click()
  if (metadata) {
    await page.getByLabel("Title").fill(metadata.title)
    await page.getByLabel("Artist").fill(metadata.artist)
  }
  await page.getByRole("button", { name: "Search lyrics" }).click()
  await expect(page.getByText("98/100 · strong · 218 seconds")).toBeVisible()
  await page.getByRole("button", { name: "Confirm recording and lyrics" }).click()
  await expect(
    page.getByRole("heading", { name: "Ready to add to the library" }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Close add track" }).click()
  await expect(page.getByRole("heading", { name: "Tracks you added" })).toBeVisible()
}

test("imports a local file without uploading its bytes", async ({ page }) => {
  await mockApplicationApi(page)
  await page.goto("/")
  await page.getByRole("button", { name: "Add track" }).click()
  await page.getByRole("button", { name: /Choose an audio file/ }).click()
  await page.getByRole("button", { name: "I understand, continue" }).click()
  await page.locator('input[type="file"]').setInputFiles(
    "public/media/beyond-the-night-fixture.mp3",
  )
  await expect(
    page.getByLabel("Local audio preview").getByText("3:38", { exact: true }),
  ).toBeVisible()
  await page.getByLabel(/Artist/).fill("Uta")
  await page.getByRole("button", { name: "Continue with this file" }).click()
  await finishLyrics(page)
  await expect(page.getByText("Local file required")).toBeVisible()
})

test("keeps ten lyric candidates usable in a bounded scrolling panel", async ({
  page,
}) => {
  const candidates = Array.from({ length: 10 }, (_, index) => ({
    ...candidate,
    providerRecordId: String(100 + index),
    durationSeconds: 210 + index,
    durationDifferenceSeconds: 8 + index,
    score: 98 - index,
  }))
  await page.setViewportSize({ width: 1000, height: 600 })
  await mockApplicationApi(page, candidates)
  await page.goto("/")
  await page.getByRole("button", { name: "Add track" }).click()
  await page.getByRole("button", { name: /Choose an audio file/ }).click()
  await page.getByRole("button", { name: "I understand, continue" }).click()
  await page.locator('input[type="file"]').setInputFiles(
    "public/media/beyond-the-night-fixture.mp3",
  )
  await page.getByLabel(/Artist/).fill("Uta")
  await page.getByRole("button", { name: "Continue with this file" }).click()
  await page.getByRole("button", { name: "Use this source" }).click()
  await page.getByRole("button", { name: "Search lyrics" }).click()

  await expect(page.getByRole("radio")).toHaveCount(10)
  await page.getByRole("button", { name: "Preview lyrics" }).first().click()
  await expect(
    page.getByLabel("Lyric preview for Beyond the Night by Uta"),
  ).toBeVisible()
  const panel = page.getByRole("dialog").locator(":scope > div")
  const dimensions = await panel.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }))
  expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.clientHeight)

  await panel.evaluate((element) => {
    element.scrollTop = element.scrollHeight
  })
  await expect(page.getByRole("button", { name: "Close add track" })).toBeInViewport()

  await panel.evaluate((element) => {
    element.scrollTop = 0
  })
  await expect(page.getByRole("heading", { name: "Find the right lyrics" })).toBeInViewport()
})

test("imports a YouTube reference through a visible provider boundary", async ({ page }) => {
  await page.addInitScript(() => {
    class Player {
      frame: HTMLIFrameElement
      currentTime = 0
      options: any

      constructor(element: HTMLElement, options: any) {
        this.options = options
        this.frame = document.createElement("iframe")
        this.frame.title = "Mock official YouTube player"
        element.append(this.frame)
        setTimeout(() =>
          options.events.onReady({ target: { getDuration: () => 218 } }),
        )
      }
      destroy() { this.frame.remove() }
      getCurrentTime() { return this.currentTime }
      getDuration() { return 218 }
      pauseVideo() { this.options.events.onStateChange({ data: 2 }) }
      playVideo() { this.options.events.onStateChange({ data: 1 }) }
      seekTo(seconds: number) { this.currentTime = seconds }
    }
    ;(window as any).YT = { Player }
  })
  await mockApplicationApi(page)
  await page.goto("/")
  await page.getByRole("button", { name: "Add track" }).click()
  await page.getByRole("button", { name: /Paste a video link/ }).click()
  await page.getByRole("button", { name: "I understand, continue" }).click()
  await page.getByLabel("YouTube URL").fill(
    "https://www.youtube.com/watch?v=M7lc1UVf-VE",
  )
  await page.getByRole("button", { name: "Load preview" }).click()
  await expect(page.getByTitle("Mock official YouTube player")).toBeVisible()
  await page.getByRole("button", { name: "Continue with this video" }).click()
  await finishLyrics(page)
  await expect(
    page.getByText("Uta · Blue · YouTube · 3:38"),
  ).toBeVisible()
  await expect(page.getByAltText("Beyond the Night YouTube thumbnail")).toBeVisible()
  await page.getByRole("button", {
    name: /Beyond the Night.*Uta.*YouTube.*3:38.*Lyrics ready/,
  }).click()
  const libraryPlayer = page.getByRole("region", {
    name: "YouTube player for Beyond the Night",
  })
  await expect(libraryPlayer).toBeVisible()
  await expect(
    libraryPlayer.getByTitle("Mock official YouTube player"),
  ).toBeVisible()
  await page.getByRole("button", { name: "Open lyrics" }).click()
  const lyricsWorkspace = page.getByRole("dialog", {
    name: "Synchronized lyrics for Beyond the Night",
  })
  await expect(lyricsWorkspace).toBeVisible()
  await expect(lyricsWorkspace.getByText("夜の向こう")).toBeVisible()
})

test("changes saved lyrics without interrupting playback and keeps them after reload", async ({
  page,
}) => {
  const replacementCandidate = {
    ...candidate,
    providerRecordId: "84",
    normalizedSegments: [
      { startSeconds: 3, endSeconds: null, text: "正しい歌詞" },
    ],
    syncedLyrics: "[00:03.00] 正しい歌詞",
    plainLyrics: "正しい歌詞",
    score: 96,
  }
  const source = {
    id: "00000000-0000-0000-0000-000000000030",
    kind: "youtube",
    availability: "available",
    externalId: "M7lc1UVf-VE",
    normalizedUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
    durationSeconds: 218,
    capabilities: { requiresVisiblePlayer: true, supportsSeeking: true },
  }
  let libraryItem = {
    libraryItemId: "00000000-0000-0000-0000-000000000010",
    trackId: "00000000-0000-0000-0000-000000000020",
    title: "Asphyxia",
    artist: "Cö shu Nie",
    album: "Asphyxia",
    durationSeconds: 218,
    preferredSourceId: source.id,
    sources: [source],
    lyrics: {
      id: "00000000-0000-0000-0000-000000000040",
      bindingId: "00000000-0000-0000-0000-000000000050",
      playbackSourceId: source.id,
      version: 1,
      language: "ja",
      timingType: "line",
      segments: candidate.normalizedSegments,
      sourceProvider: "lrclib",
      sourceRecordId: candidate.providerRecordId,
      attribution: candidate.attribution,
      rightsCapabilities: candidate.rightsCapabilities,
      timingOffsetMs: 0,
    },
  }
  await page.addInitScript(() => {
    ;(window as any).__playerMounts = 0
    ;(window as any).__playerDestroys = 0
    class Player {
      frame: HTMLIFrameElement
      currentTime = 3.5
      options: any

      constructor(element: HTMLElement, options: any) {
        ;(window as any).__playerMounts += 1
        this.options = options
        this.frame = document.createElement("iframe")
        this.frame.title = "Persistent official YouTube player"
        element.append(this.frame)
        setTimeout(() => {
          options.events.onReady({ target: { getDuration: () => 218 } })
          options.events.onStateChange({ data: 1 })
        })
      }
      destroy() {
        ;(window as any).__playerDestroys += 1
        this.frame.remove()
      }
      getCurrentTime() { return this.currentTime }
      getDuration() { return 218 }
      pauseVideo() { this.options.events.onStateChange({ data: 2 }) }
      playVideo() { this.options.events.onStateChange({ data: 1 }) }
      seekTo(seconds: number) { this.currentTime = seconds }
    }
    ;(window as any).YT = { Player }
  })
  await page.route("**/api/v1/users/*/library", (route) =>
    route.fulfill({ json: { items: [libraryItem] } }),
  )
  await page.route("**/api/v1/lyrics/candidates?*", (route) =>
    route.fulfill({
      json: {
        status: "ready",
        candidates: [candidate, replacementCandidate],
        retryAfterSeconds: null,
      },
    }),
  )
  await page.route("**/api/v1/users/*/library/*/sources/*/lyrics", async (route) => {
    const request = route.request().postDataJSON()
    expect(route.request().method()).toBe("PUT")
    expect(request.lyrics.providerRecordId).toBe("84")
    libraryItem = {
      ...libraryItem,
      lyrics: {
        ...libraryItem.lyrics,
        id: "00000000-0000-0000-0000-000000000041",
        bindingId: "00000000-0000-0000-0000-000000000051",
        version: 2,
        segments: replacementCandidate.normalizedSegments,
        sourceRecordId: replacementCandidate.providerRecordId,
        timingOffsetMs: request.lyrics.timingOffsetMs,
      },
    }
    await route.fulfill({ json: { item: libraryItem } })
  })

  await page.goto("/")
  await page.getByRole("button", {
    name: /Asphyxia.*Cö shu Nie.*YouTube.*3:38.*Lyrics ready/,
  }).click()
  await expect(page.getByTitle("Persistent official YouTube player")).toBeVisible()
  const playerCountsBeforeReplacement = await page.evaluate(() => ({
    mounts: (window as any).__playerMounts,
    destroys: (window as any).__playerDestroys,
  }))
  await page.getByRole("button", { name: "Review/change lyrics" }).click()
  await expect(
    page.getByRole("dialog", { name: "Review/change lyrics for Asphyxia" }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Search lyrics" }).click()
  await expect(page.getByRole("radio")).toHaveCount(1)
  await page.getByRole("button", { name: "Preview lyrics" }).click()
  await expect(page.getByText("正しい歌詞")).toBeVisible()
  await page.getByLabel("Timing offset (milliseconds)").fill("750")
  await page.getByRole("button", { name: "Use these lyrics" }).click()
  await expect(page.getByRole("heading", { name: "Lyrics changed" })).toBeVisible()
  await page.getByRole("button", { name: "Done" }).click()

  expect(await page.evaluate(() => ({
    mounts: (window as any).__playerMounts,
    destroys: (window as any).__playerDestroys,
  }))).toEqual(playerCountsBeforeReplacement)
  await expect(page.getByTitle("Persistent official YouTube player")).toBeVisible()
  await page.getByRole("button", { name: "Open lyrics" }).click()
  await expect(
    page.getByRole("dialog", { name: "Synchronized lyrics for Asphyxia" })
      .getByText("正しい歌詞"),
  ).toBeVisible()

  await page.getByRole("button", {
    name: "Close lyrics and return to collection",
  }).click()
  await page.reload()
  await page.getByRole("button", {
    name: /Asphyxia.*Cö shu Nie.*YouTube.*3:38.*Lyrics ready/,
  }).click()
  await page.getByRole("button", { name: "Open lyrics" }).click()
  await expect(
    page.getByRole("dialog", { name: "Synchronized lyrics for Asphyxia" })
      .getByText("正しい歌詞"),
  ).toBeVisible()
})
