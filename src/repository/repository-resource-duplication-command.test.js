import {
  describe,
  expect,
  it,
  vi
} from 'vitest'

import {
  createRepositoryScopeStore
} from './repository-scope-store.js'

import {
  createRepositoryResourceDuplicationCommand
} from './repository-resource-duplication-command.js'


function createBpmnRuntime() {
  let definitions = null

  return {
    diagramActions: {
      async loadDiagram() {
        definitions = {
          rootElements: [{
            $type: 'bpmn:Process',
            id: 'Process_A',
            name: 'Process A'
          }],
          diagrams: []
        }
      }
    },
    modeler: {
      getDefinitions() {
        return definitions
      }
    }
  }
}


function createActiveRepository(repository) {
  return {
    get() {
      return repository
    }
  }
}


function createMemoryFolder() {
  const files = new Map()
  const directories = new Map()

  function directory(name = 'root') {
    return {
      kind: 'directory',
      name,
      async getDirectoryHandle(childName, { create = false } = {}) {
        if (!directories.has(childName)) {
          if (!create) throw new Error(`Directory not found: ${childName}`)
          directories.set(childName, directory(childName))
        }
        return directories.get(childName)
      },
      async getFileHandle(fileName, { create = false } = {}) {
        if (!files.has(fileName)) {
          if (!create) throw new Error(`File not found: ${fileName}`)
          let content = ''
          files.set(fileName, {
            kind: 'file',
            name: fileName,
            async createWritable() {
              return {
                async write(value) { content = value },
                async close() {}
              }
            },
            async getFile() {
              return { async text() { return content } }
            }
          })
        }
        return files.get(fileName)
      }
    }
  }

  return directory()
}


describe(
  'Repository resource duplication command',
  () => {

    it(
      'duplicates from the active Source into a distinct user Source and refreshes the Browser after COPY',
      async () => {

        const repositoryScopeStore =
          createRepositoryScopeStore()

        const sourceRepository =
          repositoryScopeStore
            .createRepository('source-a')

        const targetRepository =
          repositoryScopeStore
            .createRepository('source-b')

        sourceRepository.workspace.mode =
          'folder'
        targetRepository.workspace.mode =
          'folder'
        targetRepository.workspace.directoryHandle =
          createMemoryFolder()

        sourceRepository.documents
          .addDocument({
            id: 'document-a',
            fileName: 'processes/a.bpmn',
            kind: 'bpmn',
            content: '<definitions id="A" />'
          })

        const renderRepositoryBrowser =
          vi.fn()

        const runtime =
          createBpmnRuntime()

        const duplicateActiveRepositoryResource =
          createRepositoryResourceDuplicationCommand({
            repositoryScopeStore,
            activeRepository:
              createActiveRepository(
                sourceRepository
              ),
            createDocumentId() {
              return 'document-a-copy'
            },
            diagramActions:
              runtime.diagramActions,
            modeler:
              runtime.modeler,
            renderRepositoryBrowser
          })

        const result =
          await duplicateActiveRepositoryResource({
            sourceDocumentId:
              'document-a',
            targetRepositoryId:
              'source-b'
          })

        expect(result.status).toBe('copied')
        expect(
          targetRepository.documents
            .getDocument('document-a-copy')
            .fileName
        ).toBe('processes/a.bpmn')
        expect(renderRepositoryBrowser)
          .toHaveBeenCalledTimes(1)
      }
    )


    it(
      'returns CONFLICT without refreshing the Browser',
      async () => {

        const repositoryScopeStore =
          createRepositoryScopeStore()

        const sourceRepository =
          repositoryScopeStore
            .createRepository('source-a')

        const targetRepository =
          repositoryScopeStore
            .createRepository('source-b')

        sourceRepository.workspace.mode = 'folder'
        targetRepository.workspace.mode = 'folder'
        targetRepository.workspace.directoryHandle =
          createMemoryFolder()

        sourceRepository.documents.addDocument({
          id: 'document-a',
          fileName: 'shared.bpmn',
          kind: 'bpmn',
          content: '<definitions id="A" />'
        })

        targetRepository.documents.addDocument({
          id: 'document-b',
          fileName: 'shared.bpmn',
          kind: 'bpmn',
          content: '<definitions id="B" />'
        })

        const renderRepositoryBrowser = vi.fn()

        const duplicateActiveRepositoryResource =
          createRepositoryResourceDuplicationCommand({
            repositoryScopeStore,
            activeRepository:
              createActiveRepository(sourceRepository),
            createDocumentId() {
              return 'unused'
            },
            diagramActions: {},
            modeler: {},
            renderRepositoryBrowser
          })

        const result =
          await duplicateActiveRepositoryResource({
            sourceDocumentId: 'document-a',
            targetRepositoryId: 'source-b'
          })

        expect(result.status).toBe('conflict')
        expect(renderRepositoryBrowser)
          .not.toHaveBeenCalled()
      }
    )


    it(
      'rejects the active Source and memory runtime as user targets',
      async () => {

        const repositoryScopeStore =
          createRepositoryScopeStore()

        const runtimeRepository =
          repositoryScopeStore
            .createRepository('runtime')

        const sourceRepository =
          repositoryScopeStore
            .createRepository('source-a')

        sourceRepository.workspace.mode = 'folder'

        const duplicateActiveRepositoryResource =
          createRepositoryResourceDuplicationCommand({
            repositoryScopeStore,
            activeRepository:
              createActiveRepository(sourceRepository),
            createDocumentId() {
              return 'copy'
            }
          })

        await expect(
          duplicateActiveRepositoryResource({
            sourceDocumentId: 'document-a',
            targetRepositoryId: 'source-a'
          })
        ).rejects.toThrow(
          'distinct source and target Sources'
        )

        await expect(
          duplicateActiveRepositoryResource({
            sourceDocumentId: 'document-a',
            targetRepositoryId:
              runtimeRepository.id
          })
        ).rejects.toThrow(
          'target must be a user Source'
        )
      }
    )
  }
)
