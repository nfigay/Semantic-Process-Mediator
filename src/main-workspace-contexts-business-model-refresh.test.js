import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const source = fs.readFileSync(path.join(here, 'main.js'), 'utf8')

function between(start, end) {
  const from = source.indexOf(start)
  expect(from, `Missing start marker: ${start}`).toBeGreaterThanOrEqual(0)
  const until = source.indexOf(end, from + start.length)
  expect(until, `Missing end marker: ${end}`).toBeGreaterThan(from)
  return source.slice(from, until)
}

// Structural wiring guards only. Behavioral guarantees remain in the
// main-open-zip-consolidated and archive-observability suites.
describe('workspace contexts refresh wiring', () => {
  it('keeps Business Model and Contexts refresh wired in the Folder and Archive activation paths', () => {
    const folder = between('async onOpenWorkspaceFolder()', "'[Local Workspace Inventory Succeeded]'")
    const archive = between('async activateArchive(resources, { fallbackName })', "'[Workspace Archive Inventory Succeeded]'")

    for (const segment of [folder, archive]) {
      expect(segment).toMatch(/businessModelExplorerView\s*\?\.refresh\?\.\(\)/)
      expect(segment).toMatch(/contextsBrowser\s*\.(?:\?\.)?render(?:\?\.)?\(\)/)
      expect(segment).toMatch(/projectRepositoryBpmnDocuments\s*\(/)
    }
  })
})
