import { describe, it, expect, vi } from 'vitest'
import module from './data-store-occurrence-context-pad-module.js'

function harness(type, linked = true) {
  let provider
  const created = []
  const started = []
  const immediate = []
  const master = { id: 'Master_1', name: 'Shared' }
  const key = type === 'bpmn:DataObjectReference' ? 'dataObjectRef' : 'dataStoreRef'
  const bo = { $type: type, name: 'Source', dataState: { name: 'draft' }, ...(linked ? { [key]: master } : {}) }
  const source = { businessObject: bo, x: 10, y: 20, width: 100, height: 80, parent: { id: 'parent' } }
  const Ctor = module.semarchDataStoreOccurrenceContextPadProvider[1]
  new Ctor(
    { registerProvider: p => { provider = p } },
    { start: (...args) => started.push(args) },
    { createShape: (...args) => immediate.push(args) },
    { createShape: input => { created.push(input); return { ...input, width: 60, height: 50 } } },
    { create: (kind, props) => ({ $type: kind, ...props }) },
    text => text
  )
  return { source, master, key, created, started, immediate, entries: () => provider.getContextPadEntries(source) }
}

describe('DataObject / DataStore — create another occurrence', () => {
  for (const type of ['bpmn:DataObjectReference', 'bpmn:DataStoreReference']) {
    it(`${type}: same master, new reference, no copied name/state`, () => {
      const h = harness(type)
      const entries = h.entries()
      expect(Object.keys(entries)).toHaveLength(1)
      const action = Object.values(entries)[0].action
      action.click({}, h.source)
      expect(h.immediate).toHaveLength(1)
      const newBo = h.created[0].businessObject
      expect(newBo.$type).toBe(type)
      expect(newBo[h.key]).toBe(h.master)
      expect(newBo).not.toHaveProperty('name')
      expect(newBo).not.toHaveProperty('dataState')
      expect(newBo).not.toBe(h.source.businessObject)
      action.dragstart({}, h.source)
      expect(h.started).toHaveLength(1)
    })
    it(`${type}: unavailable when no master`, () => {
      expect(harness(type, false).entries()).toEqual({})
    })
  }
  it('does not affect unrelated BPMN elements', () => {
    expect(harness('bpmn:Task').entries()).toEqual({})
  })
})
