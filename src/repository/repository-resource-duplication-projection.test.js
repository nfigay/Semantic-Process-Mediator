import {
  describe,
  expect,
  it
} from 'vitest'

import {
  createRepositoryScopeStore
} from './repository-scope-store.js'

import {
  createEnvironmentProjection
} from './environment-projection.js'

import {
  projectRepositoryBpmnDocuments
} from './repository-bpmn-projection.js'

import {
  duplicateAndProjectRepositoryResource
} from './repository-resource-duplication-projection.js'


function createBpmnRuntime(definitionsByContent) {

  let definitions = null

  return {
    diagramActions: {
      async loadDiagram(content) {
        definitions =
          definitionsByContent[content]
      }
    },
    modeler: {
      getDefinitions() {
        return definitions
      }
    }
  }
}


function createDefinitions({
  processId,
  processName
}) {

  return {
    rootElements: [{
      $type: 'bpmn:Process',
      id: processId,
      name: processName
    }],
    diagrams: []
  }
}


describe(
  'Repository resource duplication semantic projection',
  () => {

    it(
      'keeps source projection unchanged and enriches target projection with the duplicated BPMN resource',
      async () => {

        const scopeStore =
          createRepositoryScopeStore()

        const sourceRepository =
          scopeStore.createRepository(
            'source-a'
          )

        const targetRepository =
          scopeStore.createRepository(
            'source-b'
          )

        const sourceContent =
          '<definitions id="A" />'

        const targetContent =
          '<definitions id="B" />'

        sourceRepository.documents
          .addDocument({
            id: 'document-a',
            fileName: 'processes/a.bpmn',
            kind: 'bpmn',
            content: sourceContent,
            dirty: false
          })

        targetRepository.documents
          .addDocument({
            id: 'document-b',
            fileName: 'processes/b.bpmn',
            kind: 'bpmn',
            content: targetContent,
            dirty: false
          })

        const runtime =
          createBpmnRuntime({
            [sourceContent]:
              createDefinitions({
                processId: 'Process_A',
                processName: 'Process A'
              }),
            [targetContent]:
              createDefinitions({
                processId: 'Process_B',
                processName: 'Process B'
              })
          })

        await projectRepositoryBpmnDocuments({
          repositoryDocuments:
            sourceRepository.documents
              .getDocuments(),
          repositoryDocumentStore:
            sourceRepository.documents,
          diagramActions:
            runtime.diagramActions,
          modeler:
            runtime.modeler,
          repositoryModel:
            sourceRepository.model
        })

        await projectRepositoryBpmnDocuments({
          repositoryDocuments:
            targetRepository.documents
              .getDocuments(),
          repositoryDocumentStore:
            targetRepository.documents,
          diagramActions:
            runtime.diagramActions,
          modeler:
            runtime.modeler,
          repositoryModel:
            targetRepository.model
        })

        const sourceProjectionBefore =
          createEnvironmentProjection({
            repositoryModel:
              sourceRepository.model
          })

        const targetProjectionBefore =
          createEnvironmentProjection({
            repositoryModel:
              targetRepository.model
          })

        const result =
          await duplicateAndProjectRepositoryResource({
            sourceRepository,
            targetRepository,
            sourceDocumentId:
              'document-a',
            createDocumentId() {
              return 'document-a-copy'
            },
            diagramActions:
              runtime.diagramActions,
            modeler:
              runtime.modeler
          })

        const sourceProjectionAfter =
          createEnvironmentProjection({
            repositoryModel:
              sourceRepository.model
          })

        const targetProjectionAfter =
          createEnvironmentProjection({
            repositoryModel:
              targetRepository.model
          })

        expect(result.status).toBe('copied')

        expect(
          result.projectedBpmnDocuments
            .map(document => document.id)
        ).toEqual([
          'document-a-copy'
        ])

        expect(
          result.projectedBpmnComponents
            .map(component => component.id)
        ).toEqual([
          'document-a-copy::Process_A'
        ])

        expect(
          sourceProjectionAfter
        ).toEqual(
          sourceProjectionBefore
        )

        expect(
          targetProjectionBefore.processes
            .map(process => process.id)
        ).toEqual([
          'document-b::Process_B'
        ])

        expect(
          targetProjectionAfter.processes
            .map(process => process.id)
            .sort()
        ).toEqual([
          'document-a-copy::Process_A',
          'document-b::Process_B'
        ])
      }
    )


    it(
      'does not reproject the target when duplication reports a path conflict',
      async () => {

        const scopeStore =
          createRepositoryScopeStore()

        const sourceRepository =
          scopeStore.createRepository(
            'source-a'
          )

        const targetRepository =
          scopeStore.createRepository(
            'source-b'
          )

        sourceRepository.documents
          .addDocument({
            id: 'document-a',
            fileName: 'processes/shared.bpmn',
            kind: 'bpmn',
            content: '<definitions id="A" />'
          })

        targetRepository.documents
          .addDocument({
            id: 'document-b',
            fileName: 'processes/shared.bpmn',
            kind: 'bpmn',
            content: '<definitions id="B" />'
          })

        const targetProjectionBefore =
          createEnvironmentProjection({
            repositoryModel:
              targetRepository.model
          })

        const result =
          await duplicateAndProjectRepositoryResource({
            sourceRepository,
            targetRepository,
            sourceDocumentId:
              'document-a',
            createDocumentId() {
              return 'must-not-be-used'
            }
          })

        expect(result.status).toBe('conflict')

        expect(
          result.projectedBpmnDocuments
        ).toEqual([])

        expect(
          result.projectedBpmnComponents
        ).toEqual([])

        expect(
          createEnvironmentProjection({
            repositoryModel:
              targetRepository.model
          })
        ).toEqual(
          targetProjectionBefore
        )
      }
    )
  }
)
