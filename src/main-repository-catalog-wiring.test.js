import {
  describe,
  expect,
  it
} from 'vitest'

import fs from 'node:fs'


describe(
  'main Repository catalog wiring',
  () => {

    it(
      'provides Repository descriptors and delegates selected scope switching',
      () => {

        const source =
          fs.readFileSync(
            new URL(
              './main.js',
              import.meta.url
            ),
            'utf8'
          )


        expect(
          source
        ).toContain(
          "from './repository/active-repository-switch.js'"
        )


        const createAppStart =
          source.indexOf(
            'createApp({'
          )

        expect(
          createAppStart
        ).toBeGreaterThanOrEqual(
          0
        )


        const createAppEnd =
          source.indexOf(
            '\n  })',
            createAppStart
          )

        expect(
          createAppEnd
        ).toBeGreaterThan(
          createAppStart
        )


        const composition =
          source.slice(
            createAppStart,
            createAppEnd
          )


        expect(
          composition
        ).toContain(
          'getRepositories'
        )

        expect(
          composition
        ).toContain(
          'repositoryScopeStore'
        )

        expect(
          composition
        ).toContain(
          '.getRepositories()'
        )

        expect(
          composition
        ).toContain(
          'onRepositorySelect'
        )

        expect(
          composition
        ).toContain(
          'switchActiveRepository({'
        )

        expect(
          composition
        ).toContain(
          'activeRepository'
        )

        expect(
          composition
        ).toContain(
          'diagramActions'
        )

        expect(
          composition
        ).toContain(
          'app.showArchimate'
        )

        expect(
          composition
        ).toContain(
          'app.repositoryBrowser'
        )

        expect(
          composition
        ).toContain(
          'businessModelExplorerView'
        )


        expect(
          composition
        ).not.toContain(
          '.getRepository('
        )

        expect(
          composition
        ).not.toContain(
          'activeRepository.set('
        )
      }
    )
  }
)
