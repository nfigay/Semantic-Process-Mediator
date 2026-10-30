import { describe, it, expect } from 'vitest'
import { OccurrenceLabelMaterialization } from './occurrence-label-materialization.js'

for (const [type, key] of [
  [ 'bpmn:DataObjectReference', 'dataObjectRef' ],
  [ 'bpmn:DataStoreReference', 'dataStoreRef' ]
]) {
  describe(`${type} — missing native label`, () => {
    it('creates a native label on import once, without changing BPMN semantics', () => {
      const callbacks = new Map()
      const calls = []
      const bo = { $type: type, name: '', [key]: { name: 'Master' }, dataState: { name: 'draft' } }
      const element = { id: 'ref', x: 40, y: 50, width: 36, height: 50, parent: {} , businessObject: bo }
      const snapshot = JSON.stringify(bo)
      const registry = { filter: callback => [element].filter(callback), get: () => null }
      const modeling = {
        createLabel: (...args) => { calls.push(args); element.label = { id: 'ref_label', x: 0, y: 0, width: 0, height: 0 } },
        resizeShape: (label, bounds) => { Object.assign(label, bounds) }
      }
      OccurrenceLabelMaterialization({ on: (key, priority, callback) => callbacks.set(key, callback) },
        registry, modeling, { getExternalLabelBounds: () => ({ x: 1, y: 2, width: 90, height: 20 }) })
      callbacks.get('import.done')({})
      callbacks.get('import.done')({})
      expect(calls).toHaveLength(1)
      expect(calls[0][0]).toBe(element)
      expect(calls[0][2].id).toBe('ref_label')
      expect(JSON.stringify(bo)).toBe(snapshot)
    })
    it('does not synthesize a label when no derived or explicit text exists', () => {
      const callbacks = new Map()
      const bo = { $type: type, name: '', [key]: { name: '' } }
      const element = { id: 'ref', x: 0, y: 0, width: 36, height: 50, parent: {}, businessObject: bo }
      const calls = []
      OccurrenceLabelMaterialization({ on: (key, priority, callback) => callbacks.set(key, callback) },
        { filter: callback => [element].filter(callback), get: () => null },
        { createLabel: (...args) => calls.push(args) },
        { getExternalLabelBounds: () => ({ x: 0, y: 0, width: 90, height: 20 }) })
      callbacks.get('import.done')({})
      expect(calls).toHaveLength(0)
    })
  })
}

for (const [type, key] of [
  [ 'bpmn:DataObjectReference', 'dataObjectRef' ],
  [ 'bpmn:DataStoreReference', 'dataStoreRef' ]
]) {
  describe(`${type} — native label retention after explicit name erasure`, () => {
    it('retains native external label on empty name with master/state fallback, without mutating BPMN', () => {
      const callbacks = new Map()
      const bo = { $type: type, name: 'Temporary', [key]: { name: 'Master' }, dataState: { name: 'draft' } }
      const before = JSON.stringify(bo)
      OccurrenceLabelMaterialization(
        { on: (key, priority, callback) => callbacks.set(key, callback) },
        { filter: () => [], get: () => null },
        { createLabel: () => { throw new Error('no extra modeling command') } },
        {}
      )
      const context = { element: { businessObject: bo }, newLabel: '', hints: {} }
      callbacks.get('commandStack.element.updateLabel.preExecute')({ context })
      expect(context.hints.removeShape).toBe(false)
      expect(JSON.stringify(bo)).toBe(before)
    })

    it('does not override native label removal without a fallback or for other types', () => {
      const callbacks = new Map()
      OccurrenceLabelMaterialization(
        { on: (key, priority, callback) => callbacks.set(key, callback) },
        { filter: () => [], get: () => null },
        {}, {}
      )
      const intercept = callbacks.get('commandStack.element.updateLabel.preExecute')
      for (const bo of [
        { $type: type, name: 'Old', [key]: { name: '' } },
        { $type: 'bpmn:Task', name: 'Old' }
      ]) {
        const context = { element: { businessObject: bo }, newLabel: '', hints: {} }
        intercept({ context })
        expect(context.hints.removeShape).toBeUndefined()
      }
    })
  })
}
