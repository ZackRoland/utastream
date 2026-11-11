import { readFile, writeFile } from "node:fs/promises"

import openapiTS, { astToString } from "openapi-typescript"

const openApiPath = new URL("../openapi.json", import.meta.url)
const generatedPath = new URL("../src/generated.ts", import.meta.url)
const checkOnly = process.argv.includes("--check")
const header =
  "// This file is auto-generated from openapi.json. Do not edit it manually.\n\n"

const schema = JSON.parse(await readFile(openApiPath, "utf8"))
const nodes = await openapiTS(schema, { alphabetize: true })
const generated = header + astToString(nodes)

if (checkOnly) {
  const committed = await readFile(generatedPath, "utf8").catch(() => "")

  if (committed !== generated) {
    console.error(
      "Generated API types are stale. Run `pnpm contract:generate` from the repository root.",
    )
    process.exitCode = 1
  }
} else {
  await writeFile(generatedPath, generated, "utf8")
}
