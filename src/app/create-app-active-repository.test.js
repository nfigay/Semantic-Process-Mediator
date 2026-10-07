import {
  describe,
  expect,
  it
} from 'vitest'

import fs from 'node:fs'


describe(
  'createApp ActiveRepository wiring',
  () => {

    it(
      'accepts ActiveRepository at the composition boundary and passes it to RepositoryEditorSync',
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
          /export function createApp\(\{[\s\S]*?\bactiveRepository\b[\s\S]*?\} = \{\}\)/
        )


        const repositoryBrowserConstruction =
          source.match(
            /createRepositoryBrowser\(\{[\s\S]*?\n\s*\}\)/
          )?.[0]

        expect(
          repositoryBrowserConstruction
        ).toBeTruthy()

        expect(
          repositoryBrowserConstruction
        ).toMatch(
          /\bactiveRepository\b/
        )


        const editorSyncConstruction =
          source.match(
            /createRepositoryEditorSync\(\{[\s\S]*?\}\)/
          )?.[0] ||
          ''


        expect(
          editorSyncConstruction
        ).toMatch(
          /\bactiveRepository\b/
        )


        const membershipActionsConstruction =
          source.match(
            /createRepositoryMembershipActions\(\{[\s\S]*?\}\)/
          )?.[0] ||
          ''


        expect(
          membershipActionsConstruction
        ).toMatch(
          /\bactiveRepository\b/
        )
      }
    )
  }
)
