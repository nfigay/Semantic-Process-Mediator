import {
  describe,
  expect,
  it
} from 'vitest'

import fs from 'node:fs'


describe(
  'main active Repository Local Workspace save',
  () => {

    it(
      'captures the active Repository and saves through its document store',
      () => {

        const source =
          fs.readFileSync(
            new URL(
              './main.js',
              import.meta.url
            ),
            'utf8'
          )


        const start =
          source.indexOf(
            'async onSaveLocalWorkspace()'
          )

        expect(
          start
        ).toBeGreaterThanOrEqual(
          0
        )


        const end =
          source.indexOf(
            '\n      },',
            start
          )

        expect(
          end
        ).toBeGreaterThan(
          start
        )


        const implementation =
          source.slice(
            start,
            end
          )


        expect(
          implementation
        ).toContain(
          'resolveActiveRepository()'
        )


        expect(
          implementation
        ).toMatch(
          /const\s+repositoryDocumentStore\s*=\s*repository\.documents/
        )


        expect(
          implementation
        ).toContain(
          'repositoryDocumentStore'
        )


        expect(
          implementation
        ).not.toContain(
          'app.repositoryDocumentStore'
        )
      }
    )
  }
)
