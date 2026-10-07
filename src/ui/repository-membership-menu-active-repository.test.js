import {
  describe,
  expect,
  it
} from 'vitest'

import {
  createRepositoryMembershipMenu
} from './repository-membership-menu.js'

import {
  createActiveRepository
} from '../repository/active-repository.js'

import {
  createRepositoryScopeStore
} from '../repository/repository-scope-store.js'


function createSidebarDouble() {

  const handlers =
    new Map()


  return {

    menu:
      [],

    get() {

      return null
    },

    on(
      eventName,
      handler
    ) {

      handlers.set(
        eventName,
        handler
      )
    },

    off(
      eventName,
      handler
    ) {

      if (
        handlers.get(
          eventName
        ) === handler
      ) {

        handlers.delete(
          eventName
        )
      }
    }
  }
}


function seedProcessMembership(
  repository
) {

  repository.model.addContainer({
    id:
      'coc-1',

    type:
      'coc',

    name:
      'A CoC'
  })


  repository.model.addComponent({
    id:
      'process-1',

    type:
      'process',

    name:
      'A Process'
  })


  repository.model.addReference({
    id:
      'membership:coc-1:process-1',

    type:
      'contains',

    sourceId:
      'coc-1',

    targetId:
      'process-1',

    metadata: {
      origin:
        'semarch-manual'
    }
  })
}


describe(
  'RepositoryMembershipMenu active Repository',
  () => {

    it(
      'resolves process-reference context through A -> B -> A without reconstructing the menu',
      () => {

        const repositoryScopeStore =
          createRepositoryScopeStore()


        const repositoryA =
          repositoryScopeStore.createRepository(
            'repository-a-reference'
          )


        const repositoryB =
          repositoryScopeStore.createRepository(
            'repository-b-reference'
          )


        for (
          const repository
          of [
            repositoryA,
            repositoryB
          ]
        ) {

          repository.model.addContainer({
            id:
              'coc-1',

            type:
              'coc',

            name:
              `${repository.id} CoC`
          })


          repository.model.addComponent({
            id:
              'collaboration-1',

            type:
              'collaboration',

            name:
              `${repository.id} Collaboration`
          })


          repository.model.addComponent({
            id:
              'participant-1',

            type:
              'participant',

            name:
              `${repository.id} Participant`
          })


          repository.model.addReference({
            id:
              'contains-collaboration',

            type:
              'contains',

            sourceId:
              'coc-1',

            targetId:
              'collaboration-1'
          })


          repository.model.addReference({
            id:
              'participant-reference',

            type:
              'participant',

            sourceId:
              'collaboration-1',

            targetId:
              'participant-1'
          })


          repository.model.addReference({
            id:
              'process-reference',

            type:
              'processRef',

            sourceId:
              'participant-1',

            targetId:
              'process-1'
          })
        }


        repositoryA.model.addComponent({
          id:
            'process-1',

          type:
            'process',

          name:
            'A Process'
        })


        repositoryB.model.addComponent({
          id:
            'process-1',

          type:
            'collaboration',

          name:
            'B Collaboration'
        })


        const activeRepository =
          createActiveRepository(
            repositoryA
          )


        const menu =
          createRepositoryMembershipMenu({
            sidebar:
              createSidebarDouble(),

            repositoryModel:
              repositoryA.model,

            activeRepository
          })


        const node = {
          repositoryKind:
            'process-reference',

          repositoryId:
            'process-reference'
        }


        expect(
          menu.resolveContext(
            node
          )
        ).toMatchObject({
          kind:
            'contextual-process',

          containerId:
            'coc-1',

          processId:
            'process-1',

          processReferenceId:
            'process-reference'
        })


        activeRepository.set(
          repositoryB
        )


        expect(
          menu.resolveContext(
            node
          )
        ).toBeNull()


        activeRepository.set(
          repositoryA
        )


        expect(
          menu.resolveContext(
            node
          )
        ).toMatchObject({
          kind:
            'contextual-process',

          containerId:
            'coc-1',

          processId:
            'process-1'
        })


        menu.destroy()
      }
    )


    it(
      'resolves component context through A -> B -> A without reconstructing the menu',
      () => {

        const repositoryScopeStore =
          createRepositoryScopeStore()


        const repositoryA =
          repositoryScopeStore.createRepository(
            'repository-a'
          )


        const repositoryB =
          repositoryScopeStore.createRepository(
            'repository-b'
          )


        seedProcessMembership(
          repositoryA
        )


        repositoryB.model.addContainer({
          id:
            'coc-1',

          type:
            'coc',

          name:
            'B CoC'
        })


        repositoryB.model.addComponent({
          id:
            'process-1',

          type:
            'collaboration',

          name:
            'B Collaboration'
        })


        const activeRepository =
          createActiveRepository(
            repositoryA
          )


        const sidebar =
          createSidebarDouble()


        const menu =
          createRepositoryMembershipMenu({
            sidebar,
            repositoryModel:
              repositoryA.model,
            activeRepository
          })


        const node = {
          repositoryKind:
            'component',

          repositoryId:
            'process-1'
        }


        expect(
          menu.resolveContext(
            node
          )
        ).toMatchObject({
          kind:
            'process-component',

          processId:
            'process-1',

          memberships: [
            expect.objectContaining({
              sourceId:
                'coc-1',

              targetId:
                'process-1'
            })
          ]
        })


        activeRepository.set(
          repositoryB
        )


        expect(
          menu.resolveContext(
            node
          )
        ).toBeNull()


        activeRepository.set(
          repositoryA
        )


        expect(
          menu.resolveContext(
            node
          )
        ).toMatchObject({
          kind:
            'process-component',

          processId:
            'process-1',

          memberships: [
            expect.objectContaining({
              sourceId:
                'coc-1',

              targetId:
                'process-1'
            })
          ]
        })


        menu.destroy()
      }
    )
  }
)
