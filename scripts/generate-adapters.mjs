import { buildAdapterFiles, findAdapterDrift, writeAdapterFiles } from "./lib/casa-adapters.mjs"

const checkOnly = process.argv.includes("--check")
const files = buildAdapterFiles()
const drift = findAdapterDrift(files)

if (checkOnly) {
  if (drift.length > 0) {
    console.error("Generated adapters are out of sync:")
    for (const file of drift) {
      console.error(`- ${file.targetPath}`)
    }
    process.exit(1)
  }

  console.log("Generated adapters are in sync.")
  process.exit(0)
}

writeAdapterFiles(files)
console.log(`Generated ${files.length} adapter files.`)
