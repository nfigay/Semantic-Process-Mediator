import {
  describe,
  expect,
  it
} from 'vitest'

import fs from 'node:fs'


describe(
  'main active Repository Workspace Archive save',
  () => {
    it(
      'exposes the Save Workspace Archive action and snapshots all active Repository documents',
      () => {
        const source =
          fs.readFileSync(
            new URL('./main.js', import.meta.url),
            'utf8'
          )

        const start =
          source.indexOf('onSaveWorkspaceArchive')

        expect(start).toBeGreaterThanOrEqual(0)

        const end =
          source.indexOf('\n      },', start)

        expect(end).toBeGreaterThan(start)

        const implementation = source.slice(start, end)

        expect(implementation).toContain('resolveActiveRepository()')
        expect(implementation).toMatch(
          /repository\.documents[\s\S]*getDocuments\(\)/
        )
        expect(implementation).toContain('createRepositoryWorkspaceArchive')
        expect(implementation).toMatch(/includeClean\s*:\s*true/)
        expect(implementation).toContain('download(')
        expect(implementation).toContain('application/zip')
      }
    )
  }
)
