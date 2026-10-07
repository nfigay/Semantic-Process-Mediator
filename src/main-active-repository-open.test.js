import {
  describe,
  expect,
  it
} from 'vitest'

import fs from 'node:fs'


function extractOpenRepositoryHandler(
  source
) {
  const start =
    source.indexOf(
      'repositoryFileInput.setOnLoad('
    )

  if (start < 0) {
    throw new Error(
      'Open Repository handler not found'
    )
  }

  return source.slice(start)
}


describe(
  'main Open Repository — Repository Scope',
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
          extractOpenRepositoryHandler(
            source
          )

        expect(handler).toContain(
          'repositoryScopeTransition'
        )

        expect(handler).toContain(
          '.prepareAndActivate({'
        )

        expect(handler).toContain(
          'repository.documents'
        )

        expect(handler).toContain(
          'repository.model'
        )

        expect(handler).toContain(
          'repository.businessObjectStore'
        )

        expect(handler).toContain(
          'repository.businessObjectRepresentationStore'
        )

        expect(handler).toContain(
          'repository.businessRelationStore'
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
