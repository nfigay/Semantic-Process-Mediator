import {
  describe,
  expect,
  it
} from 'vitest'

import {
  createTechnicalIntrospection
} from './technical-introspection.js'

import {
  createActiveRepository
} from '../repository/active-repository.js'

import {
  createRepositoryScopeStore
} from '../repository/repository-scope-store.js'


describe(
  'TechnicalIntrospection active Repository',
  () => {

    it(
      'queries A -> B -> A without reconstructing the facade',
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


        repositoryA.businessObjectStore
          .addBusinessObject({
            id: 'business-object-1',
            typeRefs: [ 'demo:A' ]
          })

        repositoryB.businessObjectStore
          .addBusinessObject({
            id: 'business-object-2',
            typeRefs: [ 'demo:B' ]
          })


        const activeRepository =
          createActiveRepository(
            repositoryA
          )


        const technicalIntrospection =
          createTechnicalIntrospection({
            activeRepository
          })


        const sourceIds =
          technicalIntrospection
            .getSources()
            .map(source => source.id)


        expect(
          sourceIds
        ).toEqual([
          'repositoryDocuments',
          'businessObjects',
          'businessObjectRepresentations'
        ])


        expect(
          technicalIntrospection.query({
            source: 'repositoryDocuments'
          })
        ).toEqual([
          expect.objectContaining({
            id: 'doc-1',
            fileName: 'a.bpmn'
          })
        ])

        expect(
          technicalIntrospection.query({
            source: 'businessObjects'
          })
        ).toEqual([
          expect.objectContaining({
            id: 'business-object-1'
          })
        ])


        activeRepository.set(
          repositoryB
        )


        expect(
          technicalIntrospection.query({
            source: 'repositoryDocuments'
          })
        ).toEqual([
          expect.objectContaining({
            id: 'doc-1',
            fileName: 'b.bpmn'
          })
        ])

        expect(
          technicalIntrospection.query({
            source: 'businessObjects'
          })
        ).toEqual([
          expect.objectContaining({
            id: 'business-object-2'
          })
        ])


        activeRepository.set(
          repositoryA
        )


        expect(
          technicalIntrospection.query({
            source: 'repositoryDocuments'
          })
        ).toEqual([
          expect.objectContaining({
            id: 'doc-1',
            fileName: 'a.bpmn'
          })
        ])

        expect(
          technicalIntrospection.query({
            source: 'businessObjects'
          })
        ).toEqual([
          expect.objectContaining({
            id: 'business-object-1'
          })
        ])


        expect(
          technicalIntrospection
            .getSources()
            .map(source => source.id)
        ).toEqual(
          sourceIds
        )
      }
    )


    it(
      'preserves the historical direct-store contract',
      () => {

        const repositoryScopeStore =
          createRepositoryScopeStore()

        const repository =
          repositoryScopeStore.createRepository(
            'repository-direct'
          )


        repository.documents.addDocument({
          id: 'doc-direct',
          fileName: 'direct.bpmn',
          kind: 'bpmn',
          content: '<direct />'
        })

        repository.businessObjectStore
          .addBusinessObject({
            id: 'business-object-direct',
            typeRefs: [ 'demo:Application' ]
          })


        const technicalIntrospection =
          createTechnicalIntrospection({
            repositoryDocumentStore:
              repository.documents,
            businessObjectStore:
              repository.businessObjectStore,
            businessObjectRepresentationStore:
              repository.businessObjectRepresentationStore
          })


        expect(
          technicalIntrospection.query({
            source: 'repositoryDocuments'
          })
        ).toEqual([
          expect.objectContaining({
            id: 'doc-direct'
          })
        ])

        expect(
          technicalIntrospection.query({
            source: 'businessObjects'
          })
        ).toEqual([
          expect.objectContaining({
            id: 'business-object-direct'
          })
        ])
      }
    )
  }
)
