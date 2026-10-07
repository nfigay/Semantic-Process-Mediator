import {
  describe,
  expect,
  it
} from 'vitest'

import {
  readFileSync
} from 'node:fs'

import {
  fileURLToPath
} from 'node:url'


describe(
  'createApp active Repository Graph extract',
  () => {

    it(
      'late-resolves the Repository model when producing the graph extract',
      () => {

        const createAppPath =
          fileURLToPath(
            new URL(
              './create-app.js',
              import.meta.url
            )
          )

        const source =
          readFileSync(
            createAppPath,
            'utf8'
          )


        const start =
          source.indexOf(
            'async function extractRepositoryGraph'
          )

        const end =
          source.indexOf(
            'BPMN Model extract',
            start
          )

        expect(start)
          .toBeGreaterThanOrEqual(0)

        expect(end)
          .toBeGreaterThan(start)


        const extractSource =
          source.slice(
            start,
            end
          )


        expect(extractSource).toMatch(
          /createRepositoryGraphExtract\s*\(\s*resolveActiveRepositoryModel\s*\(\s*\)\s*\)/
        )


        expect(extractSource).not.toMatch(
          /createRepositoryGraphExtract\s*\(\s*repositoryModel\s*\)/
        )
      }
    )
  }
)
