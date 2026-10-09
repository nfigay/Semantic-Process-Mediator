import { describe, expect, it, vi } from 'vitest'
import { OccurrencePropertiesHeader } from './occurrence-properties-header.js'

describe('V2D-03 native header projection', () => {
  it('registers native refresh events without writing semantic properties', async () => {
    const callbacks = new Map()
    const header = { textContent: 'Datastore5' }
    const parent = { querySelector: () => header }
    const previousDocument = globalThis.document
    const previousObserver = globalThis.MutationObserver
    let disconnect = vi.fn()
    globalThis.document = { querySelector: () => parent }
    globalThis.MutationObserver = class {
      observe() {}
      disconnect() { disconnect() }
    }
    try {
      const eventBus = { on: (name, priority, cb) => {
        callbacks.set(name, typeof priority === 'function' ? priority : cb)
      } }
      const businessObject = {
        $type: 'bpmn:DataStoreReference',
        name: 'Datastore5',
        dataState: { name: 'release' }
      }
      const selection = { get: () => [ { businessObject } ] }
      OccurrencePropertiesHeader(eventBus, selection)
      await Promise.resolve()
      expect(header.textContent).toBe('Datastore5 [release]')
      expect(businessObject.name).toBe('Datastore5')
      expect(callbacks.has('selection.changed')).toBe(true)
      expect(callbacks.has('commandStack.changed')).toBe(true)
      businessObject.dataState.name = 'draft'
      callbacks.get('commandStack.changed')()
      await Promise.resolve()
      expect(header.textContent).toBe('Datastore5 [draft]')
      callbacks.get('diagram.destroy')()
      expect(disconnect).toHaveBeenCalledOnce()
    } finally {
      globalThis.document = previousDocument
      globalThis.MutationObserver = previousObserver
    }
  })
})
