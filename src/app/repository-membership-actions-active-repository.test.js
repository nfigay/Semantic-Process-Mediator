import {
  describe,
  expect,
  it
} from 'vitest'

import {
  createRepositoryMembershipActions
} from './repository-membership-actions.js'

import {
  createActiveRepository
} from '../repository/active-repository.js'

import {
  createRepositoryScopeStore
} from '../repository/repository-scope-store.js'


function seedRepository(
  repository,
  label
) {

  repository.model.addContainer({
    id:
      'coc-1',

    type:
      'coc',

    name:
      `${label} CoC`
  })


  repository.model.addComponent({
    id:
      'process-1',

    type:
      'process',

    name:
      `${label} Process`
  })
}


describe(
  'RepositoryMembershipActions active Repository',
  () => {

    it(
      'assigns through A -> B -> A without reconstructing the consumer',
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


        seedRepository(
          repositoryA,
          'A'
        )

        seedRepository(
          repositoryB,
          'B'
        )


        const activeRepository =
          createActiveRepository(
            repositoryA
          )


        const actions =
          createRepositoryMembershipActions({
            activeRepository
          })


        const membershipA =
          actions.assignProcessToContainer(
            'coc-1',
            'process-1'
          )


        expect(
          membershipA
            .metadata
            .origin
        ).toBe(
          'semarch-manual'
        )

        expect(
          repositoryA.model.getReference(
            'membership:coc-1:process-1'
          )
        ).toBeTruthy()

        expect(
          repositoryB.model.getReference(
            'membership:coc-1:process-1'
          )
        ).toBeNull()


        activeRepository.set(
          repositoryB
        )


        const membershipB =
          actions.assignProcessToContainer(
            'coc-1',
            'process-1'
          )


        expect(
          membershipB
            .metadata
            .origin
        ).toBe(
          'semarch-manual'
        )

        expect(
          repositoryB.model.getReference(
            'membership:coc-1:process-1'
          )
        ).toBeTruthy()


        actions.unassignProcessFromContainer(
          'coc-1',
          'process-1'
        )


        expect(
          repositoryB.model.getReference(
            'membership:coc-1:process-1'
          )
        ).toBeNull()

        expect(
          repositoryA.model.getReference(
            'membership:coc-1:process-1'
          )
        ).toBeTruthy()


        activeRepository.set(
          repositoryA
        )


        expect(
          actions.isProcessAssignedToContainer(
            'coc-1',
            'process-1'
          )
        ).toBe(
          true
        )

        expect(
          repositoryA.model.getComponent(
            'process-1'
          ).name
        ).toBe(
          'A Process'
        )

        expect(
          repositoryB.model.getComponent(
            'process-1'
          ).name
        ).toBe(
          'B Process'
        )
      }
    )


    it(
      'preserves the historical direct-model contract',
      () => {

        const repositoryScopeStore =
          createRepositoryScopeStore()

        const repository =
          repositoryScopeStore.createRepository(
            'repository-direct'
          )


        seedRepository(
          repository,
          'Direct'
        )


        const actions =
          createRepositoryMembershipActions({
            repositoryModel:
              repository.model
          })


        const membership =
          actions.assignProcessToContainer(
            'coc-1',
            'process-1'
          )


        expect(
          membership.id
        ).toBe(
          'membership:coc-1:process-1'
        )

        expect(
          actions.isProcessAssignedToContainer(
            'coc-1',
            'process-1'
          )
        ).toBe(
          true
        )


        expect(
          actions.unassignProcessFromContainer(
            'coc-1',
            'process-1'
          )?.id
        ).toBe(
          'membership:coc-1:process-1'
        )

        expect(
          actions.isProcessAssignedToContainer(
            'coc-1',
            'process-1'
          )
        ).toBe(
          false
        )
      }
    )
  }
)
