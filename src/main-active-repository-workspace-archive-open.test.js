import {
  describe,
  expect,
  it
} from 'vitest'

import fs from 'node:fs'


function extractWorkspaceArchiveOpenHandler(
  source
) {
  const start =
    source.indexOf(
      'workspaceArchiveFileInput.setOnLoad('
    )

  const end =
    source.indexOf(
      'viewerBpmnFileInput.setOnLoad(',
      start
    )

  if (
    start < 0 ||
    end < 0
  ) {
    throw new Error(
      'Workspace Archive open handler not found'
    )
  }

  return source.slice(
    start,
    end
  )
}


describe(
  'main Workspace Archive open — Repository Scope',
  () => {
    it(
      'prepares and activates a new autonomous Repository without clearing the current Repository',
      () => {
        const source =
          fs.readFileSync(
            new URL(
              './main.js',
              import.meta.url
            ),
            'utf8'
          )

        const handler =
          extractWorkspaceArchiveOpenHandler(
            source
          )

        expect(handler).toContain(
          'repositoryScopeTransition'
        )

        expect(handler).toContain(
          '.prepareAndActivate({'
        )

        expect(handler).toContain(
          'candidateRepository.documents'
        )

        expect(handler).toMatch(
          /candidateRepository\.workspace\.mode\s*=\s*['"]archive['"]/
        )

        expect(handler).not.toContain(
          'repositoryDocumentStore.clear()'
        )

        expect(handler).not.toContain(
          'repositoryModel.clear()'
        )

        expect(handler).not.toContain(
          'businessObjectStore.clear()'
        )

        expect(handler).not.toContain(
          'businessObjectRepresentationStore.clear()'
        )

        expect(handler).not.toContain(
          'businessRelationStore.clear()'
        )

        expect(handler).not.toContain(
          'identityOriginStore.clear()'
        )

        expect(handler).not.toContain(
          'businessObjectExternalIdentityStore.clear()'
        )
      }
    )
  }
)
