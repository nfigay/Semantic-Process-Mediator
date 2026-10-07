import { describe, expect, it, vi } from 'vitest'

import { createRepositoryScopeStore } from './repository-scope-store.js'
import { createRepositoryResourceDuplicationCommand } from './repository-resource-duplication-command.js'

function createActiveRepository(repository) {
  return { get() { return repository } }
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

function createBpmnRuntime() {
  let definitions = null
  return {
    diagramActions: {
      async loadDiagram() {
        definitions = {
          rootElements: [{ $type: 'bpmn:Process', id: 'Process_A', name: 'Process A' }],
          diagrams: []
        }
      }
    },
    modeler: { getDefinitions() { return definitions } }
  }
}

describe('Repository resource duplication physical contract', () => {
  it('materializes COPY in the target folder at the same relative path', async () => {
    const store = createRepositoryScopeStore()
    const source = store.createRepository('workspace')
    const target = store.createRepository('Test')

    source.workspace.mode = 'folder'
    target.workspace.mode = 'folder'
    target.workspace.directoryHandle = createMemoryFolder()

    source.documents.addDocument({
      id: 'document-a',
      fileName: 'processes/nested/a.bpmn',
      kind: 'bpmn',
      content: '<definitions id="A" />',
      dirty: false
    })

    const runtime = createBpmnRuntime()
    const renderRepositoryBrowser = vi.fn()
    const duplicate = createRepositoryResourceDuplicationCommand({
      repositoryScopeStore: store,
      activeRepository: createActiveRepository(source),
      createDocumentId() { return 'document-a-copy' },
      diagramActions: runtime.diagramActions,
      modeler: runtime.modeler,
      renderRepositoryBrowser
    })

    const result = await duplicate({
      sourceDocumentId: 'document-a',
      targetRepositoryId: 'Test'
    })

    expect(result.status).toBe('copied')

    const processes = await target.workspace.directoryHandle
      .getDirectoryHandle('processes')
    const nested = await processes.getDirectoryHandle('nested')
    const targetFile = await nested.getFileHandle('a.bpmn')
    const targetContent = await (await targetFile.getFile()).text()

    expect(targetContent).toBe('<definitions id="A" />')
    expect(target.workspace.fileHandles.get('document-a-copy')).toBe(targetFile)
    expect(source.documents.getDocument('document-a').content)
      .toBe('<definitions id="A" />')
  })
})
