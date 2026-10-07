import {
  describe,
  expect,
  it
} from 'vitest'

import {
  serializeBusinessModelDocumentJson
} from '../model/business-model-json-codec.js'

import {
  activateRepositoryBusinessModel
} from './repository-business-model-activation.js'

import {
  createRepositoryScopeStore
} from './repository-scope-store.js'


function addBusinessModelDocument(
  repository,
  {
    businessObjectName,
    originSystemRef,
    externalIdentityValue
  }
) {
  return repository.documents.addDocument({
    id:
      'business-1',

    fileName:
      'enterprise.business.json',

    kind:
      'business-model',

    content:
      serializeBusinessModelDocumentJson({
        identityOrigins: [
          {
            id:
              'ORIGIN-1',

            systemRef:
              originSystemRef
          }
        ],

        businessObjects: [
          {
            id:
              'BO-1',

            name:
              businessObjectName,

            typeRefs:
              [ 'demo:Application' ]
          }
        ],

        businessRelations: [
          {
            sourceBusinessObjectId:
              'BO-1',

            targetBusinessObjectId:
              'BO-1',

            relationType:
              'demo:self'
          }
        ],

        businessObjectExternalIdentities: [
          {
            businessObjectId:
              'BO-1',

            originRef:
              'ORIGIN-1',

            value:
              externalIdentityValue
          }
        ]
      }),

    dirty:
      false
  })
}


function activate(repository) {
  return activateRepositoryBusinessModel({
    repositoryDocuments:
      repository.documents.getDocuments(),

    businessObjectStore:
      repository.businessObjectStore,

    businessRelationStore:
      repository.businessRelationStore,

    identityOriginStore:
      repository.identityOriginStore,

    businessObjectExternalIdentityStore:
      repository.businessObjectExternalIdentityStore
  })
}


describe(
  'Repository scope Business Model semantic state',
  () => {
    it(
      'owns independent Business Model semantic stores for each repository',
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
          repositoryA.businessObjectStore
        ).not.toBe(
          repositoryB.businessObjectStore
        )

        expect(
          repositoryA.businessRelationStore
        ).not.toBe(
          repositoryB.businessRelationStore
        )

        expect(
          repositoryA.identityOriginStore
        ).not.toBe(
          repositoryB.identityOriginStore
        )

        expect(
          repositoryA.businessObjectExternalIdentityStore
        ).not.toBe(
          repositoryB.businessObjectExternalIdentityStore
        )
      }
    )

    it(
      'keeps overlapping Business Model identities local to repository scope',
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

        addBusinessModelDocument(
          repositoryA,
          {
            businessObjectName:
              'Application A',

            originSystemRef:
              'system-a',

            externalIdentityValue:
              'external-a'
          }
        )

        addBusinessModelDocument(
          repositoryB,
          {
            businessObjectName:
              'Application B',

            originSystemRef:
              'system-b',

            externalIdentityValue:
              'external-b'
          }
        )

        activate(repositoryA)
        activate(repositoryB)

        expect(
          repositoryA.businessObjectStore
            .getBusinessObject(
              'BO-1'
            )
            .name
        ).toBe(
          'Application A'
        )

        expect(
          repositoryB.businessObjectStore
            .getBusinessObject(
              'BO-1'
            )
            .name
        ).toBe(
          'Application B'
        )

        expect(
          repositoryA.identityOriginStore
            .getIdentityOrigins()
        ).toEqual([
          {
            id:
              'ORIGIN-1',

            systemRef:
              'system-a'
          }
        ])

        expect(
          repositoryB.identityOriginStore
            .getIdentityOrigins()
        ).toEqual([
          {
            id:
              'ORIGIN-1',

            systemRef:
              'system-b'
          }
        ])

        expect(
          repositoryA.businessObjectExternalIdentityStore
            .getBusinessObjectExternalIdentities()
            [0]
            .value
        ).toBe(
          'external-a'
        )

        expect(
          repositoryB.businessObjectExternalIdentityStore
            .getBusinessObjectExternalIdentities()
            [0]
            .value
        ).toBe(
          'external-b'
        )
      }
    )

    it(
      're-activates one repository without mutating another repository semantic state',
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

        const documentA =
          addBusinessModelDocument(
            repositoryA,
            {
              businessObjectName:
                'Application A',

              originSystemRef:
                'system-a',

              externalIdentityValue:
                'external-a'
            }
          )

        addBusinessModelDocument(
          repositoryB,
          {
            businessObjectName:
              'Application B',

            originSystemRef:
              'system-b',

            externalIdentityValue:
              'external-b'
          }
        )

        activate(repositoryA)
        activate(repositoryB)

        const businessObjectsB =
          repositoryB.businessObjectStore
            .getBusinessObjects()

        const businessRelationsB =
          repositoryB.businessRelationStore
            .getBusinessRelations()

        const identityOriginsB =
          repositoryB.identityOriginStore
            .getIdentityOrigins()

        const externalIdentitiesB =
          repositoryB.businessObjectExternalIdentityStore
            .getBusinessObjectExternalIdentities()

        repositoryA.documents.updateDocument(
          documentA.id,
          {
            content:
              serializeBusinessModelDocumentJson({
                identityOrigins: [
                  {
                    id:
                      'ORIGIN-1',

                    systemRef:
                      'system-a-2'
                  }
                ],

                businessObjects: [
                  {
                    id:
                      'BO-1',

                    name:
                      'Application A2',

                    typeRefs:
                      [ 'demo:Application' ]
                  }
                ],

                businessRelations:
                  [],

                businessObjectExternalIdentities:
                  []
              })
          }
        )

        activate(repositoryA)

        expect(
          repositoryA.businessObjectStore
            .getBusinessObject(
              'BO-1'
            )
            .name
        ).toBe(
          'Application A2'
        )

        expect(
          repositoryA.businessRelationStore
            .getBusinessRelations()
        ).toEqual([])

        expect(
          repositoryB.businessObjectStore
            .getBusinessObjects()
        ).toEqual(
          businessObjectsB
        )

        expect(
          repositoryB.businessRelationStore
            .getBusinessRelations()
        ).toEqual(
          businessRelationsB
        )

        expect(
          repositoryB.identityOriginStore
            .getIdentityOrigins()
        ).toEqual(
          identityOriginsB
        )

        expect(
          repositoryB.businessObjectExternalIdentityStore
            .getBusinessObjectExternalIdentities()
        ).toEqual(
          externalIdentitiesB
        )
      }
    )

    it(
      'recreates removed repository semantic stores without mutating another repository',
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

        repositoryA.businessObjectStore
          .addBusinessObject({
            id:
              'BO-1',

            typeRefs:
              [ 'demo:A' ]
          })

        const businessObjectB =
          repositoryB.businessObjectStore
            .addBusinessObject({
              id:
                'BO-1',

              typeRefs:
                [ 'demo:B' ]
            })

        const previousBusinessObjectStore =
          repositoryA.businessObjectStore

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
          repositoryA2.businessObjectStore
        ).not.toBe(
          previousBusinessObjectStore
        )

        expect(
          repositoryA2.businessObjectStore
            .getBusinessObjects()
        ).toEqual([])

        expect(
          repositoryB.businessObjectStore
            .getBusinessObject(
              'BO-1'
            )
        ).toBe(
          businessObjectB
        )
      }
    )
  }
)
