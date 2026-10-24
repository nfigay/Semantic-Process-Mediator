import { describe, expect, it, vi } from 'vitest'
import { createRepositoryEditorSync } from './repository-editor-sync.js'

const BPMN = id => `<?xml version="1.0"?><bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="${id}" />`
function harness({ documents, activeId, definitionId }) {
  const handlers = new Map()
  const store = {
    getDocuments: () => documents,
    getActiveDocument: () => documents.find(d => d.id === activeId) || null,
    updateDocument: (id, update) => {
      const doc = documents.find(d => d.id === id)
      Object.assign(doc, update)
      return doc
    }
  }
  const modeler = {
    get(name) {
      if (name === 'eventBus') return {
        on: (event, fn) => handlers.set(event, fn),
        off: (event) => handlers.delete(event)
      }
      throw Error('Unexpected service')
    },
    getDefinitions: () => ({ id: definitionId }),
    saveXML: vi.fn(async () => ({ xml: BPMN(definitionId) }))
  }
  const sync = createRepositoryEditorSync({
    modeler, repositoryDocumentStore: store,
    repositoryModel: {}, repositoryBrowser: { render: vi.fn() }
  })
  return { sync, modeler, store }
}

describe('WS-01 snapshot owner gate', () => {
  it('blocks a different active canvas without writing any document', async () => {
    const documents = [{ id: 'a', kind: 'bpmn', content: BPMN('A') }, { id: 'b', kind: 'bpmn', content: BPMN('B') }]
    const { sync, modeler } = harness({ documents, activeId: 'a', definitionId: 'B' })
    expect(await sync.flushForSnapshot()).toBe(false)
    expect(modeler.saveXML).not.toHaveBeenCalled()
    expect(documents[0].content).toBe(BPMN('A'))
    sync.destroy()
  })
  it('blocks ambiguous definitions ids without writing', async () => {
    const documents = [{ id: 'a', kind: 'bpmn', content: BPMN('A') }, { id: 'b', kind: 'bpmn', content: BPMN('A') }]
    const { sync, modeler } = harness({ documents, activeId: 'a', definitionId: 'A' })
    expect(await sync.flushForSnapshot()).toBe(false)
    expect(modeler.saveXML).not.toHaveBeenCalled()
    sync.destroy()
  })
  it('flushes unique canvas owner before returning success', async () => {
    const documents = [{ id: 'a', kind: 'bpmn', content: BPMN('A') }, { id: 'b', kind: 'bpmn', content: BPMN('B') }]
    const { sync, modeler } = harness({ documents, activeId: 'b', definitionId: 'B' })
    expect(await sync.flushForSnapshot()).toBe(true)
    expect(modeler.saveXML).toHaveBeenCalledOnce()
    expect(documents[0].content).toBe(BPMN('A'))
    sync.destroy()
  })
})
