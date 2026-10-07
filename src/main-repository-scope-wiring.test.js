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
  'main Repository Scope wiring',
  () => {

    it(
      'creates one scoped runtime Repository, makes it active, and injects the same Repository boundary into createApp',
      () => {

        const mainPath =
          fileURLToPath(
            new URL(
              './main.js',
              import.meta.url
            )
          )

        const source =
          readFileSync(
            mainPath,
            'utf8'
          )


        expect(source).toMatch(
          /import\s*\{\s*createRepositoryScopeStore\s*\}\s*from\s*['"]\.\/repository\/repository-scope-store\.js['"]/
        )


        expect(source).toMatch(
          /import\s*\{\s*createActiveRepository\s*\}\s*from\s*['"]\.\/repository\/active-repository\.js['"]/
        )


        expect(source).toMatch(
          /const\s+repositoryScopeStore\s*=\s*createRepositoryScopeStore\s*\(\s*\)/
        )


        const repositoryCreation =
          source.match(
            /const\s+runtimeRepository\s*=\s*repositoryScopeStore\s*\.\s*createRepository\s*\(\s*[^)]+\s*\)/
          )?.[0] ||
          ''

        expect(
          repositoryCreation
        ).not.toBe(
          ''
        )


        expect(source).toMatch(
          /const\s+activeRepository\s*=\s*createActiveRepository\s*\(\s*runtimeRepository\s*\)/
        )


        const createAppCall =
          source.match(
            /createApp\s*\(\s*\{[\s\S]*?\}\s*\)/
          )?.[0] ||
          ''


        expect(
          createAppCall
        ).toMatch(
          /\brepository\s*:\s*runtimeRepository\b/
        )


        expect(
          createAppCall
        ).toMatch(
          /\bactiveRepository\b/
        )

      }
    )


    it(
      'wires Source selection through active Repository switching and refreshes Environment projections',
      () => {

        const mainPath =
          fileURLToPath(
            new URL(
              './main.js',
              import.meta.url
            )
          )

        const source =
          readFileSync(
            mainPath,
            'utf8'
          )

        const sourceSelectionStart =
          source.indexOf(
            'onSourceSelect:'
          )

        const repositorySelectionStart =
          source.indexOf(
            'onRepositorySelect:',
            sourceSelectionStart
          )

        expect(
          sourceSelectionStart
        ).toBeGreaterThanOrEqual(0)

        expect(
          repositorySelectionStart
        ).toBeGreaterThan(
          sourceSelectionStart
        )

        const sourceSelection =
          source.slice(
            sourceSelectionStart,
            repositorySelectionStart
          )

        expect(sourceSelection).toContain(
          'switchActiveRepository({'
        )

        expect(sourceSelection).toContain(
          'activeRepository'
        )

        expect(sourceSelection).toContain(
          'renderRepositoryBrowser:'
        )

        expect(sourceSelection).toContain(
          'app.repositoryBrowser'
        )

        expect(sourceSelection).toContain(
          'refreshBusinessModelExplorer:'
        )
      }
    )

    it(
      'wires the active Source resource duplication command without putting duplication logic in the Browser',
      () => {

        const mainPath =
          fileURLToPath(
            new URL(
              './main.js',
              import.meta.url
            )
          )

        const source =
          readFileSync(
            mainPath,
            'utf8'
          )

        expect(source).toMatch(
          /import\s*\{\s*createRepositoryResourceDuplicationCommand\s*\}\s*from\s*['"]\.\/repository\/repository-resource-duplication-command\.js['"]/ 
        )

        expect(source).toContain(
          'const duplicateActiveRepositoryResource ='
        )

        expect(source).toContain(
          'createRepositoryResourceDuplicationCommand({'
        )

        expect(source).toContain(
          'repositoryScopeStore,'
        )

        expect(source).toContain(
          'activeRepository,'
        )

        expect(source).toContain(
          'createDocumentId:'
        )

        expect(source).toContain(
          'repositoryBrowser.render()'
        )

        expect(source).toContain(
          'app.duplicateActiveRepositoryResource ='
        )
      }
    )

  }
)
