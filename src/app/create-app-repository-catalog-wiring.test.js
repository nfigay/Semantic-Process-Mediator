import {
  describe,
  expect,
  it
} from 'vitest'

import fs from 'node:fs'


describe(
  'createApp Repository catalog wiring',
  () => {

    it(
      'exposes Repository catalog and selection seams to RepositoryBrowser',
      () => {

        const source =
          fs.readFileSync(
            new URL(
              './create-app.js',
              import.meta.url
            ),
            'utf8'
          )


        expect(
          source
        ).toMatch(
          /getRepositories/
        )


        expect(
          source
        ).toMatch(
          /onRepositorySelect/
        )


        const browserCallStart =
          source.indexOf(
            'createRepositoryBrowser({'
          )


        expect(
          browserCallStart
        ).toBeGreaterThanOrEqual(
          0
        )


        const browserCallEnd =
          source.indexOf(
            '})',
            browserCallStart
          )


        expect(
          browserCallEnd
        ).toBeGreaterThan(
          browserCallStart
        )


        const browserComposition =
          source.slice(
            browserCallStart,
            browserCallEnd
          )


        expect(
          browserComposition
        ).toContain(
          'getRepositories'
        )


        expect(
          browserComposition
        ).toContain(
          'onRepositorySelect'
        )
      }
    )
  }
)
