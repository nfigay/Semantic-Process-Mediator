import {
  describe,
  expect,
  it
} from 'vitest'

import {
  createRepositoryScopeStore
} from './repository-scope-store.js'

import {
  duplicateRepositoryResource
} from './repository-resource-duplication.js'


describe(
  'Repository resource duplication',
  () => {

    it(
      'duplicates one resource into a distinct target scope while leaving the source unchanged and the copy independent',
      () => {

        const repositoryScopeStore =
          createRepositoryScopeStore()

        const sourceRepository =
          repositoryScopeStore
            .createRepository(
              'source-a'
            )

        const targetRepository =
          repositoryScopeStore
            .createRepository(
              'source-b'
            )

        sourceRepository.documents
          .addDocument({
            id:
              'document-a',
            fileName:
              'processes/a.bpmn',
            kind:
              'bpmn',
            content:
              '<definitions id="A" />',
            dirty:
              false
          })

        targetRepository.documents
          .addDocument({
            id:
              'document-b',
            fileName:
              'processes/b.bpmn',
            kind:
              'bpmn',
            content:
              '<definitions id="B" />',
            dirty:
              false
          })

        const sourceBefore =
          sourceRepository.documents
            .getDocuments()
            .map(document => ({
              ...document
            }))

        const result =
          duplicateRepositoryResource({
            sourceRepository,
            targetRepository,
            sourceDocumentId:
              'document-a',
            createDocumentId() {
              return 'document-a-copy'
            }
          })


        expect(
          result.status
        ).toBe(
          'copied'
        )

        expect(
          result.path
        ).toBe(
          'processes/a.bpmn'
        )

        expect(
          sourceRepository.documents
            .getDocuments()
        ).toEqual(
          sourceBefore
        )

        expect(
          targetRepository.documents
            .getDocuments()
        ).toEqual([
          {
            id:
              'document-b',
            fileName:
              'processes/b.bpmn',
            kind:
              'bpmn',
            content:
              '<definitions id="B" />',
            dirty:
              false
          },
          {
            id:
              'document-a-copy',
            fileName:
              'processes/a.bpmn',
            kind:
              'bpmn',
            content:
              '<definitions id="A" />',
            dirty:
              false
          }
        ])

        expect(
          result.targetDocument
        ).not.toBe(
          result.sourceDocument
        )


        targetRepository.documents
          .updateDocument(
            'document-a-copy',
            {
              content:
                '<definitions id="B-copy" />',
              dirty:
                true
            }
          )


        expect(
          sourceRepository.documents
            .getDocument(
              'document-a'
            )
        ).toEqual({
          id:
            'document-a',
          fileName:
            'processes/a.bpmn',
          kind:
            'bpmn',
          content:
            '<definitions id="A" />',
          dirty:
            false
        })
      }
    )


    it(
      'reports a path conflict without modifying either scope',
      () => {

        const repositoryScopeStore =
          createRepositoryScopeStore()

        const sourceRepository =
          repositoryScopeStore
            .createRepository(
              'source-a'
            )

        const targetRepository =
          repositoryScopeStore
            .createRepository(
              'source-b'
            )

        sourceRepository.documents
          .addDocument({
            id:
              'document-a',
            fileName:
              'processes/shared.bpmn',
            kind:
              'bpmn',
            content:
              '<definitions id="A" />'
          })

        targetRepository.documents
          .addDocument({
            id:
              'document-b',
            fileName:
              'processes/shared.bpmn',
            kind:
              'bpmn',
            content:
              '<definitions id="B" />'
          })

        const sourceBefore =
          sourceRepository.documents
            .getDocuments()
            .map(document => ({
              ...document
            }))

        const targetBefore =
          targetRepository.documents
            .getDocuments()
            .map(document => ({
              ...document
            }))

        let createDocumentIdCalls =
          0

        const result =
          duplicateRepositoryResource({
            sourceRepository,
            targetRepository,
            sourceDocumentId:
              'document-a',
            createDocumentId() {
              createDocumentIdCalls +=
                1

              return 'must-not-be-used'
            }
          })


        expect(
          result.status
        ).toBe(
          'conflict'
        )

        expect(
          result.path
        ).toBe(
          'processes/shared.bpmn'
        )

        expect(
          createDocumentIdCalls
        ).toBe(
          0
        )

        expect(
          sourceRepository.documents
            .getDocuments()
        ).toEqual(
          sourceBefore
        )

        expect(
          targetRepository.documents
            .getDocuments()
        ).toEqual(
          targetBefore
        )
      }
    )
  }
)
