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

import {
  createRepositoryScopeTransition
} from './repository-scope-transition.js'


function seedRepository(
  repository,
  name
) {

  repository.documents.addDocument({
    id:
      'doc-1',
    fileName:
      `${name}.bpmn`,
    kind:
      'bpmn',
    content:
      `<${name} />`,
    dirty:
      false
  })

  repository.model.addComponent({
    id:
      'process-1',
    type:
      'process',
    name,
    documentId:
      'doc-1'
  })
}


describe(
  'Repository scope transition',
  () => {

    it(
      'prepares B without mutating A, activates B only after success, and permits A -> B -> A',
      async () => {

        const scopeStore =
          createRepositoryScopeStore()

        const repositoryA =
          scopeStore.createRepository(
            'repository-a'
          )

        seedRepository(
          repositoryA,
          'A'
        )

        const activeRepository =
          createActiveRepository(
            repositoryA
          )

        const transition =
          createRepositoryScopeTransition({
            repositoryScopeStore:
              scopeStore,
            activeRepository
          })


        let observedActiveDuringPreparation =
          null


        const repositoryB =
          await transition.prepareAndActivate({
            repositoryId:
              'repository-b',

            async prepare(repository) {

              observedActiveDuringPreparation =
                activeRepository.get()

              seedRepository(
                repository,
                'B'
              )
            }
          })


        expect(
          observedActiveDuringPreparation
        ).toBe(
          repositoryA
        )

        expect(
          activeRepository.get()
        ).toBe(
          repositoryB
        )

        expect(
          scopeStore.getRepository(
            'repository-a'
          )
        ).toBe(
          repositoryA
        )

        expect(
          scopeStore.getRepository(
            'repository-b'
          )
        ).toBe(
          repositoryB
        )

        expect(
          repositoryA.model
            .getComponent('process-1')
            .name
        ).toBe(
          'A'
        )

        expect(
          repositoryB.model
            .getComponent('process-1')
            .name
        ).toBe(
          'B'
        )

        expect(
          repositoryA.documents
            .getDocument('doc-1')
            .content
        ).toBe(
          '<A />'
        )

        expect(
          repositoryB.documents
            .getDocument('doc-1')
            .content
        ).toBe(
          '<B />'
        )


        activeRepository.set(
          repositoryA
        )


        expect(
          activeRepository.get()
        ).toBe(
          repositoryA
        )

        expect(
          repositoryA.model
            .getComponent('process-1')
            .name
        ).toBe(
          'A'
        )
      }
    )


    it(
      'removes the provisional Repository when activation fails and leaves A active',
      async () => {

        const scopeStore =
          createRepositoryScopeStore()

        const repositoryA =
          scopeStore.createRepository(
            'repository-a'
          )

        seedRepository(
          repositoryA,
          'A'
        )


        let currentRepository =
          repositoryA


        const activeRepository = {
          get() {

            return currentRepository
          },

          set(repository) {

            if (
              repository.id ===
                'repository-b'
            ) {

              throw new Error(
                'activation failed'
              )
            }

            currentRepository =
              repository

            return currentRepository
          }
        }


        const transition =
          createRepositoryScopeTransition({
            repositoryScopeStore:
              scopeStore,
            activeRepository
          })


        await expect(
          transition.prepareAndActivate({
            repositoryId:
              'repository-b',

            async prepare(repository) {

              seedRepository(
                repository,
                'B'
              )
            }
          })
        ).rejects.toThrow(
          'activation failed'
        )


        expect(
          activeRepository.get()
        ).toBe(
          repositoryA
        )

        expect(
          scopeStore.getRepository(
            'repository-a'
          )
        ).toBe(
          repositoryA
        )

        expect(
          scopeStore.getRepository(
            'repository-b'
          )
        ).toBeNull()

        expect(
          repositoryA.model
            .getComponent('process-1')
            .name
        ).toBe(
          'A'
        )

        expect(
          repositoryA.documents
            .getDocument('doc-1')
            .content
        ).toBe(
          '<A />'
        )
      }
    )


    it(
      'rolls back only the provisional Repository when preparation fails',
      async () => {

        const scopeStore =
          createRepositoryScopeStore()

        const repositoryA =
          scopeStore.createRepository(
            'repository-a'
          )

        seedRepository(
          repositoryA,
          'A'
        )

        const activeRepository =
          createActiveRepository(
            repositoryA
          )

        const transition =
          createRepositoryScopeTransition({
            repositoryScopeStore:
              scopeStore,
            activeRepository
          })


        await expect(
          transition.prepareAndActivate({
            repositoryId:
              'repository-b',

            async prepare(repository) {

              seedRepository(
                repository,
                'B'
              )

              throw new Error(
                'preparation failed'
              )
            }
          })
        ).rejects.toThrow(
          'preparation failed'
        )


        expect(
          activeRepository.get()
        ).toBe(
          repositoryA
        )

        expect(
          scopeStore.getRepository(
            'repository-a'
          )
        ).toBe(
          repositoryA
        )

        expect(
          scopeStore.getRepository(
            'repository-b'
          )
        ).toBeNull()

        expect(
          repositoryA.model
            .getComponent('process-1')
            .name
        ).toBe(
          'A'
        )

        expect(
          repositoryA.documents
            .getDocument('doc-1')
            .content
        ).toBe(
          '<A />'
        )
      }
    )
  }
)
