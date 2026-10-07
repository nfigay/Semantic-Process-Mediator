import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const source = fs.readFileSync(path.join(here, 'main.js'), 'utf8')

describe('workspace contexts refresh after Business Model activation', () => {
  it('refreshes both Business Model Explorer and Contexts browser for local workspace and archive open paths', () => {
    const activationRefresh = /if\s*\(\s*repository\.workspace\s*\.loadedBusinessModelState\s*\)\s*\{[\s\S]*?businessModelExplorerView\s*\?\.refresh\?\.\(\)[\s\S]*?contextsBrowser\s*\?\.render\?\.\(\)[\s\S]*?\}/g
    const matches = source.match(activationRefresh) || []
    expect(matches).toHaveLength(2)
  })
})
