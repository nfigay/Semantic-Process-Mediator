import {
  describe,
  expect,
  it
} from 'vitest'

import {
  createBusinessObjectStore
} from '../model/business-object-store.js'

import {
  createBusinessRelationStore
} from '../model/business-relation-store.js'

import {
  createIdentityOriginStore
} from '../model/identity-origin-store.js'

import {
  createBusinessObjectExternalIdentityStore
} from '../model/business-object-external-identity-store.js'

import {
  serializeBusinessModelDocumentJson
} from '../model/business-model-json-codec.js'

import {
  activateRepositoryBusinessModel
} from './repository-business-model-activation.js'

import {
  createRepositoryScopeStore
} from './repository-scope-store.js'


function createBusinessModelStores() {
  return {
    businessObjectStore:
      createBusinessObjectStore(),

    businessRelationStore:
      createBusinessRelationStore(),

    identityOriginStore:
      createIdentityOriginStore(),

    businessObjectExternalIdentityStore:
      createBusinessObjectExternalIdentityStore()
  }
}


function addBusinessModelDocument(
  repository,
  {
    repositoryDocumentId,
    businessObjectName,
    originSystemRef,
    externalIdentityValue
  }
) {
  const content =
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
    })

  return repository.documents.addDocument({
    id:
      repositoryDocumentId,

    fileName:
      'enterprise.business.json',

    kind:
      'business-model',

    content,

    dirty:
      false
  })
}


function activate(
  repository,
  stores
) {
  return activateRepositoryBusinessModel({
    repositoryDocuments:
      repository.documents.getDocuments(),

    ...stores
  })
}


describe(
  'Repository scope Business Model isolation experiment',
  () => {
    it(
      'keeps overlapping Business Model identities independent when each repository has its own semantic stores',
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

        addBusinessModelDocument(
          repositoryA,
          {
            repositoryDocumentId:
              'business-1',

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
            repositoryDocumentId:
              'business-1',

            businessObjectName:
              'Application B',

            originSystemRef:
              'system-b',

            externalIdentityValue:
              'external-b'
          }
        )

        const storesA =
          createBusinessModelStores()

        const storesB =
          createBusinessModelStores()

        activate(
          repositoryA,
          storesA
        )

        activate(
          repositoryB,
          storesB
        )

        expect(
          storesA.businessObjectStore
            .getBusinessObject(
              'BO-1'
            )
            .name
        ).toBe(
          'Application A'
        )

        expect(
          storesB.businessObjectStore
            .getBusinessObject(
              'BO-1'
            )
            .name
        ).toBe(
          'Application B'
        )

        expect(
          storesA.identityOriginStore
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
          storesB.identityOriginStore
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
          storesA.businessObjectExternalIdentityStore
            .getBusinessObjectExternalIdentities()
            [0]
            .value
        ).toBe(
          'external-a'
        )

        expect(
          storesB.businessObjectExternalIdentityStore
            .getBusinessObjectExternalIdentities()
            [0]
            .value
        ).toBe(
          'external-b'
        )

        expect(
          storesA.businessRelationStore
            .getBusinessRelations()
        ).toHaveLength(
          1
        )

        expect(
          storesB.businessRelationStore
            .getBusinessRelations()
        ).toHaveLength(
          1
        )
      }
    )

    it(
      're-activates one repository without mutating the other repository semantic state',
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

        const documentA =
          addBusinessModelDocument(
            repositoryA,
            {
              repositoryDocumentId:
                'business-1',

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
            repositoryDocumentId:
              'business-1',

            businessObjectName:
              'Application B',

            originSystemRef:
              'system-b',

            externalIdentityValue:
              'external-b'
          }
        )

        const storesA =
          createBusinessModelStores()

        const storesB =
          createBusinessModelStores()

        activate(
          repositoryA,
          storesA
        )

        activate(
          repositoryB,
          storesB
        )

        const snapshotB = {
          businessObjects:
            storesB.businessObjectStore
              .getBusinessObjects(),

          businessRelations:
            storesB.businessRelationStore
              .getBusinessRelations(),

          identityOrigins:
            storesB.identityOriginStore
              .getIdentityOrigins(),

          externalIdentities:
            storesB.businessObjectExternalIdentityStore
              .getBusinessObjectExternalIdentities()
        }

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

        activate(
          repositoryA,
          storesA
        )

        expect(
          storesA.businessObjectStore
            .getBusinessObject(
              'BO-1'
            )
            .name
        ).toBe(
          'Application A2'
        )

        expect(
          storesA.businessRelationStore
            .getBusinessRelations()
        ).toEqual([])

        expect(
          storesA.identityOriginStore
            .getIdentityOrigins()
        ).toEqual([
          {
            id:
              'ORIGIN-1',

            systemRef:
              'system-a-2'
          }
        ])

        expect(
          storesA.businessObjectExternalIdentityStore
            .getBusinessObjectExternalIdentities()
        ).toEqual([])

        expect(
          storesB.businessObjectStore
            .getBusinessObjects()
        ).toEqual(
          snapshotB.businessObjects
        )

        expect(
          storesB.businessRelationStore
            .getBusinessRelations()
        ).toEqual(
          snapshotB.businessRelations
        )

        expect(
          storesB.identityOriginStore
            .getIdentityOrigins()
        ).toEqual(
          snapshotB.identityOrigins
        )

        expect(
          storesB.businessObjectExternalIdentityStore
            .getBusinessObjectExternalIdentities()
        ).toEqual(
          snapshotB.externalIdentities
        )
      }
    )

    it(
      'shows that sharing semantic stores makes activation replace the previously loaded repository state',
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

        addBusinessModelDocument(
          repositoryA,
          {
            repositoryDocumentId:
              'business-1',

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
            repositoryDocumentId:
              'business-1',

            businessObjectName:
              'Application B',

            originSystemRef:
              'system-b',

            externalIdentityValue:
              'external-b'
          }
        )

        const sharedStores =
          createBusinessModelStores()

        activate(
          repositoryA,
          sharedStores
        )

        expect(
          sharedStores.businessObjectStore
            .getBusinessObject(
              'BO-1'
            )
            .name
        ).toBe(
          'Application A'
        )

        activate(
          repositoryB,
          sharedStores
        )

        expect(
          sharedStores.businessObjectStore
            .getBusinessObject(
              'BO-1'
            )
            .name
        ).toBe(
          'Application B'
        )

        expect(
          sharedStores.identityOriginStore
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
          sharedStores.businessObjectExternalIdentityStore
            .getBusinessObjectExternalIdentities()
            [0]
            .value
        ).toBe(
          'external-b'
        )
      }
    )
  }
)
