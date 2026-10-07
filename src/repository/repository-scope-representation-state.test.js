import {
  describe,
  expect,
  it
} from 'vitest'

import {
  createRepositoryScopeStore
} from './repository-scope-store.js'


describe(
  'Repository scope Business Object Representation state',
  () => {
    it(
      'owns an independent representation store for each repository',
      () => {
        const store =
          createRepositoryScopeStore()

        const repositoryA =
          store.createRepository(
            'repository-a'
          )

        const repositoryB =
          store.createRepository(
            'repository-b'
          )

        expect(
          repositoryA.businessObjectRepresentationStore
        ).not.toBe(
          repositoryB.businessObjectRepresentationStore
        )
      }
    )

    it(
      'keeps identical document-qualified representation links local to repository scope',
      () => {
        const store =
          createRepositoryScopeStore()

        const repositoryA =
          store.createRepository(
            'repository-a'
          )

        const repositoryB =
          store.createRepository(
            'repository-b'
          )

        const representationA =
          repositoryA.businessObjectRepresentationStore
            .attach({
              businessObjectId:
                'BO-1',

              documentId:
                'doc-1',

              representationId:
                'DataStore_1'
            })

        const representationB =
          repositoryB.businessObjectRepresentationStore
            .attach({
              businessObjectId:
                'BO-1',

              documentId:
                'doc-1',

              representationId:
                'DataStore_1'
            })

        expect(
          repositoryA.businessObjectRepresentationStore
            .getRepresentations(
              'BO-1'
            )
        ).toEqual([
          representationA
        ])

        expect(
          repositoryB.businessObjectRepresentationStore
            .getRepresentations(
              'BO-1'
            )
        ).toEqual([
          representationB
        ])

        expect(
          representationA
        ).not.toBe(
          representationB
        )
      }
    )

    it(
      'detaches and clears one repository representation state without mutating another',
      () => {
        const store =
          createRepositoryScopeStore()

        const repositoryA =
          store.createRepository(
            'repository-a'
          )

        const repositoryB =
          store.createRepository(
            'repository-b'
          )

        const link = {
          businessObjectId:
            'BO-1',

          documentId:
            'doc-1',

          representationId:
            'DataStore_1'
        }

        repositoryA.businessObjectRepresentationStore
          .attach(link)

        const representationB =
          repositoryB.businessObjectRepresentationStore
            .attach(link)

        repositoryA.businessObjectRepresentationStore
          .detach(link)

        expect(
          repositoryA.businessObjectRepresentationStore
            .getRepresentations(
              'BO-1'
            )
        ).toEqual([])

        expect(
          repositoryB.businessObjectRepresentationStore
            .getRepresentations(
              'BO-1'
            )
        ).toEqual([
          representationB
        ])

        repositoryA.businessObjectRepresentationStore
          .attach(link)

        repositoryA.businessObjectRepresentationStore
          .clear()

        expect(
          repositoryA.businessObjectRepresentationStore
            .getBusinessObjectRepresentations()
        ).toEqual([])

        expect(
          repositoryB.businessObjectRepresentationStore
            .getBusinessObjectRepresentations()
        ).toEqual([
          representationB
        ])
      }
    )

    it(
      'recreates a removed repository with a fresh representation store',
      () => {
        const store =
          createRepositoryScopeStore()

        const repositoryA =
          store.createRepository(
            'repository-a'
          )

        const repositoryB =
          store.createRepository(
            'repository-b'
          )

        repositoryA.businessObjectRepresentationStore
          .attach({
            businessObjectId:
              'BO-1',

            documentId:
              'doc-1',

            representationId:
              'DataStore_1'
          })

        const representationB =
          repositoryB.businessObjectRepresentationStore
            .attach({
              businessObjectId:
                'BO-1',

            documentId:
              'doc-1',

            representationId:
              'DataStore_1'
          })

        const previousRepresentationStore =
          repositoryA.businessObjectRepresentationStore

        expect(
          store.removeRepository(
            'repository-a'
          )
        ).toBe(
          true
        )

        const repositoryA2 =
          store.createRepository(
            'repository-a'
          )

        expect(
          repositoryA2.businessObjectRepresentationStore
        ).not.toBe(
          previousRepresentationStore
        )

        expect(
          repositoryA2.businessObjectRepresentationStore
            .getBusinessObjectRepresentations()
        ).toEqual([])

        expect(
          repositoryB.businessObjectRepresentationStore
            .getBusinessObjectRepresentations()
        ).toEqual([
          representationB
        ])
      }
    )
  }
)
