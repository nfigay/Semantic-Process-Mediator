import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = path.dirname(fileURLToPath(import.meta.url))
const caseDirectory = path.join(
  here,
  'EA-PRE-01',
  'cases',
  'grouping-association-001'
)

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(caseDirectory, relativePath), 'utf8')
  )
}

describe('EA-PRE-01 evidence case contract', () => {
  it('keeps one stable case identity across manifest and assertions', () => {
    const manifest = readJson('case.json')
    const expected = readJson('expected/assertions.json')

    expect(manifest.schemaVersion).toBe(1)
    expect(manifest.id).toBe('EA-PRE-01-GROUPING-001')
    expect(expected.caseId).toBe(manifest.id)
    expect(expected.assertions.length).toBeGreaterThan(0)
    expect(new Set(expected.assertions.map(({ id }) => id)).size)
      .toBe(expected.assertions.length)
  })

  it('does not claim unavailable raw evidence', () => {
    const manifest = readJson('case.json')

    for (const relativePath of Object.values(manifest.inputs)) {
      if (relativePath === null) continue

      expect(fs.existsSync(path.join(caseDirectory, relativePath))).toBe(true)
    }
  })

  it('keeps all initial evidence assertions pending', () => {
    const expected = readJson('expected/assertions.json')

    expect(expected.assertions.every(({ status }) => status === 'pending'))
      .toBe(true)
  })
})
