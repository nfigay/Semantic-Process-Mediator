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
  'createApp active Repository view resolution',
  () => {

    it(
      'late-resolves the Repository model for navigation while preserving the historical fallback',
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


        expect(source).toMatch(
          /function\s+resolveActiveRepositoryModel\s*\(\s*\)\s*\{[\s\S]*?activeRepository\s*\?\.\s*get\s*\?\.\s*\(\s*\)\s*\?\.\s*model\s*\|\|\s*repositoryModel[\s\S]*?\}/
        )


        const selectionStart =
          source.indexOf(
            'function resolveSelectionView'
          )

        const navigationStart =
          source.indexOf(
            'Repository -> BPMN navigation',
            selectionStart
          )

        expect(selectionStart)
          .toBeGreaterThanOrEqual(0)

        expect(navigationStart)
          .toBeGreaterThan(selectionStart)


        const resolutionSource =
          source.slice(
            selectionStart,
            navigationStart
          )


        const calls =
          [
            ...resolutionSource.matchAll(
              /resolveRepositoryView\s*\(\s*\{([\s\S]*?)\}\s*\)/g
            )
          ]


        expect(calls)
          .toHaveLength(4)


        for (
          const call
          of calls
        ) {

          expect(
            call[1]
          ).toMatch(
            /repositoryModel\s*:\s*resolveActiveRepositoryModel\s*\(\s*\)/
          )
        }


        expect(
          resolutionSource
        ).not.toMatch(
          /resolveRepositoryView\s*\(\s*\{\s*repositoryModel\s*,/
        )
      }
    )
  }
)
