import {
  describe,
  expect,
  it
} from 'vitest'

import {
  createRepositoryScopeStore
} from './repository-scope-store.js'

import {
  createActiveRepository
} from './active-repository.js'


describe(
  'ActiveRepository',
  () => {

    it(
      'switches A -> B -> A while preserving repository identity and state',
      () => {

        const scopeStore =
          createRepositoryScopeStore()

        const repositoryA =
          scopeStore.createRepository(
            'repository-a'
          )

        const repositoryB =
          scopeStore.createRepository(
            'repository-b'
          )


        repositoryA.documents.addDocument({
          id: 'doc-1',
          fileName: 'a.bpmn',
          kind: 'bpmn',
          content: '<a />'
        })

        repositoryB.documents.addDocument({
          id: 'doc-1',
          fileName: 'b.bpmn',
          kind: 'bpmn',
          content: '<b />'
        })


        const activeRepository =
          createActiveRepository(
            repositoryA
          )


        expect(
          activeRepository.get()
        ).toBe(
          repositoryA
        )

        expect(
          activeRepository
            .get()
            .documents
            .getDocument('doc-1')
            .content
        ).toBe(
          '<a />'
        )


        expect(
          activeRepository.set(
            repositoryB
          )
        ).toBe(
          repositoryB
        )

        expect(
          activeRepository.get()
        ).toBe(
          repositoryB
        )

        expect(
          activeRepository
            .get()
            .documents
            .getDocument('doc-1')
            .content
        ).toBe(
          '<b />'
        )


        expect(
          activeRepository.set(
            repositoryA
          )
        ).toBe(
          repositoryA
        )

        expect(
          activeRepository.get()
        ).toBe(
          repositoryA
        )

        expect(
          activeRepository
            .get()
            .documents
            .getDocument('doc-1')
            .content
        ).toBe(
          '<a />'
        )


        expect(
          scopeStore.getRepositories()
        ).toEqual([
          repositoryA,
          repositoryB
        ])
      }
    )


    it(
      'accepts null as the absence of an active repository',
      () => {

        const activeRepository =
          createActiveRepository()

        expect(
          activeRepository.get()
        ).toBeNull()


        expect(
          activeRepository.set(null)
        ).toBeNull()

        expect(
          activeRepository.get()
        ).toBeNull()
      }
    )
  }
)
