import {
  describe,
  expect,
  it,
  vi
} from 'vitest'

import {
  createActiveRepository
} from '../repository/active-repository.js'

import {
  createRepositoryScopeStore
} from '../repository/repository-scope-store.js'

import {
  createBusinessObjectRepresentationActions
} from './business-object-representation-actions.js'

import {
  createBusinessRelationActions
} from './business-relation-actions.js'


function seedRepository(
  repository,
  label
) {

  repository.businessObjectStore.addBusinessObject({
    id: 'BO-1',
    name: `${label} One`,
    typeRefs: [ 'example:Object' ]
  })

  repository.businessObjectStore.addBusinessObject({
    id: 'BO-2',
    name: `${label} Two`,
    typeRefs: [ 'example:Object' ]
  })
}


describe(
  'Business Model actions active Repository',
  () => {

    it(
      'mutates A -> B -> A through one action boundary without reconstructing it',
      () => {

        const scope =
          createRepositoryScopeStore()

        const repositoryA =
          scope.createRepository(
            'repository-a'
          )

        const repositoryB =
          scope.createRepository(
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

        const representationChanged =
          vi.fn()

        const relationChanged =
          vi.fn()

        const representationActions =
          createBusinessObjectRepresentationActions({
            activeRepository,
            onChanged:
              representationChanged
          })

        const relationActions =
          createBusinessRelationActions({
            activeRepository,
            onChanged:
              relationChanged
          })


        representationActions
          .attachBusinessObject(
            'BO-1',
            'SharedRepresentation'
          )

        relationActions
          .addBusinessRelation({
            sourceBusinessObjectId:
              'BO-1',
            targetBusinessObjectId:
              'BO-2',
            relationType:
              'example:relatedTo'
          })


        expect(
          repositoryA
            .businessObjectRepresentationStore
            .getRepresentations(
              'BO-1'
            )
        ).toHaveLength(
          1
        )

        expect(
          repositoryA
            .businessRelationStore
            .getBusinessRelations()
        ).toHaveLength(
          1
        )

        expect(
          repositoryB
            .businessObjectRepresentationStore
            .getRepresentations(
              'BO-1'
            )
        ).toEqual([])

        expect(
          repositoryB
            .businessRelationStore
            .getBusinessRelations()
        ).toEqual([])


        activeRepository.set(
          repositoryB
        )


        expect(
          representationActions
            .isBusinessObjectAttached(
              'BO-1',
              'SharedRepresentation'
            )
        ).toBe(
          false
        )

        representationActions
          .attachBusinessObject(
            'BO-1',
            'SharedRepresentation'
          )

        relationActions
          .addBusinessRelation({
            sourceBusinessObjectId:
              'BO-1',
            targetBusinessObjectId:
              'BO-2',
            relationType:
              'example:dependsOn'
          })


        expect(
          repositoryB
            .businessObjectRepresentationStore
            .getRepresentations(
              'BO-1'
            )
        ).toHaveLength(
          1
        )

        expect(
          repositoryB
            .businessRelationStore
            .getBusinessRelations()
        ).toEqual([
          {
            sourceBusinessObjectId:
              'BO-1',
            targetBusinessObjectId:
              'BO-2',
            relationType:
              'example:dependsOn'
          }
        ])

        expect(
          relationChanged
        ).toHaveBeenLastCalledWith([
          {
            sourceBusinessObjectId:
              'BO-1',
            targetBusinessObjectId:
              'BO-2',
            relationType:
              'example:dependsOn'
          }
        ])


        activeRepository.set(
          repositoryA
        )


        expect(
          representationActions
            .isBusinessObjectAttached(
              'BO-1',
              'SharedRepresentation'
            )
        ).toBe(
          true
        )

        expect(
          representationActions
            .getBusinessObjectsByRepresentationId(
              'SharedRepresentation'
            )
            .map(
              businessObject =>
                businessObject.name
            )
        ).toEqual([
          'A One'
        ])

        expect(
          repositoryA
            .businessRelationStore
            .getBusinessRelations()
        ).toEqual([
          {
            sourceBusinessObjectId:
              'BO-1',
            targetBusinessObjectId:
              'BO-2',
            relationType:
              'example:relatedTo'
          }
        ])
      }
    )

  }
)
