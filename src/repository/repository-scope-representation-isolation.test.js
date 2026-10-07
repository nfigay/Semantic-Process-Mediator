import {
  describe,
  expect,
  it
} from 'vitest'

import {
  createBusinessObjectRepresentationStore
} from '../model/business-object-representation-store.js'

import {
  createRepositoryScopeStore
} from './repository-scope-store.js'


describe(
  'Repository scope Business Object Representation isolation experiment',
  () => {
    it(
      'keeps identical document-qualified representation identities independent with separate stores',
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

        const representationsA =
          createBusinessObjectRepresentationStore()

        const representationsB =
          createBusinessObjectRepresentationStore()

        representationsA.attach({
          businessObjectId:
            'BO-1',

          documentId:
            'doc-1',

          representationId:
            'DataStore_1'
        })

        representationsB.attach({
          businessObjectId:
            'BO-1',

          documentId:
            'doc-1',

          representationId:
            'DataStore_1'
        })

        expect(
          representationsA
            .getRepresentations(
              'BO-1'
            )
        ).toEqual([
          {
            businessObjectId:
              'BO-1',

            documentId:
              'doc-1',

            representationId:
              'DataStore_1'
          }
        ])

        expect(
          representationsB
            .getRepresentations(
              'BO-1'
            )
        ).toEqual([
          {
            businessObjectId:
              'BO-1',

            documentId:
              'doc-1',

            representationId:
              'DataStore_1'
          }
        ])

        expect(
          repositoryA.id
        ).not.toBe(
          repositoryB.id
        )
      }
    )

    it(
      'clears and detaches one repository representation state without mutating another',
      () => {
        const representationsA =
          createBusinessObjectRepresentationStore()

        const representationsB =
          createBusinessObjectRepresentationStore()

        representationsA.attach({
          businessObjectId:
            'BO-1',

          documentId:
            'doc-1',

          representationId:
            'DataStore_1'
        })

        representationsB.attach({
          businessObjectId:
            'BO-1',

          documentId:
            'doc-1',

          representationId:
            'DataStore_1'
        })

        representationsA.detach({
          businessObjectId:
            'BO-1',

          documentId:
            'doc-1',

          representationId:
            'DataStore_1'
        })

        expect(
          representationsA
            .getRepresentations(
              'BO-1'
            )
        ).toEqual([])

        expect(
          representationsB
            .getRepresentations(
              'BO-1'
            )
        ).toHaveLength(
          1
        )

        representationsA.attach({
          businessObjectId:
            'BO-1',

          documentId:
            'doc-1',

          representationId:
            'DataStore_1'
        })

        representationsA.clear()

        expect(
          representationsA
            .getBusinessObjectRepresentations()
        ).toEqual([])

        expect(
          representationsB
            .getBusinessObjectRepresentations()
        ).toHaveLength(
          1
        )
      }
    )

    it(
      'shows that a shared store cannot preserve repository-local links with the same full link identity',
      () => {
        const sharedRepresentations =
          createBusinessObjectRepresentationStore()

        const representationA =
          sharedRepresentations.attach({
            businessObjectId:
              'BO-1',

            documentId:
              'doc-1',

            representationId:
              'DataStore_1'
          })

        const representationB =
          sharedRepresentations.attach({
            businessObjectId:
              'BO-1',

            documentId:
              'doc-1',

            representationId:
              'DataStore_1'
          })

        expect(
          representationA
        ).not.toBe(
          representationB
        )

        expect(
          sharedRepresentations
            .getRepresentations(
              'BO-1'
            )
        ).toEqual([
          representationB
        ])

        expect(
          sharedRepresentations
            .getBusinessObjectRepresentations()
        ).toHaveLength(
          1
        )
      }
    )
  }
)
