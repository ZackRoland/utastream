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

async function mockApplicationApi(page: Page) {
  await page.route("**/api/v1/users/*/library", (route) =>
    route.fulfill({ json: { items: [] } }),
  )
  await page.route("**/api/v1/lyrics/candidates?*", (route) =>
    route.fulfill({
      json: { status: "ready", candidates: [candidate], retryAfterSeconds: null },
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
            version: 1,
            language: "ja",
            timingType: "line",
            segments: candidate.normalizedSegments,
            sourceProvider: candidate.sourceProvider,
            sourceRecordId: candidate.providerRecordId,
            attribution: candidate.attribution,
            rightsCapabilities: candidate.rightsCapabilities,
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
  await expect(page.getByText("YouTube", { exact: true })).toBeVisible()
  await expect(page.getByAltText("Beyond the Night YouTube thumbnail")).toBeVisible()
  await page.getByRole("button", { name: "Play Beyond the Night with YouTube" }).click()
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
