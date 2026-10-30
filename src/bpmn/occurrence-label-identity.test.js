import { describe, it, expect } from 'vitest'
import { OccurrenceLabelMaterialization } from './occurrence-label-materialization.js'
import { OccurrenceLabelRefresh } from './occurrence-label-refresh.js'

for (const type of [ 'bpmn:DataObjectReference', 'bpmn:DataStoreReference' ]) {
  describe(`${type}: reference and external label share semantic identity`, () => {
    it('materializes the reference, never materializes a label of that reference on import', () => {
      const callbacks = new Map()
      const businessObject = { $type: type, name: '',
        [type === 'bpmn:DataStoreReference' ? 'dataStoreRef' : 'dataObjectRef']: { name: 'Master' } }
      const shape = { id: 'ref', x: 10, y: 20, width: 40, height: 40,
        parent: {}, businessObject }
      const label = { id: 'ref_label', labelTarget: shape, businessObject,
        x: 10, y: 70, width: 80, height: 20, parent: {} }
      shape.label = label
      const creates = [], resizes = []
      OccurrenceLabelMaterialization(
        { on: (name, priority, cb) => callbacks.set(name, cb) },
        { filter: predicate => [ shape, label ].filter(predicate), get: id => id === label.id ? label : null },
        { createLabel: (...args) => creates.push(args), resizeShape: (...args) => resizes.push(args) },
        { getExternalLabelBounds: () => ({ width: 80, height: 20 }) }
      )
      callbacks.get('import.done')({})
      expect(creates).toHaveLength(0)
      // A single resize is permitted for the target's existing label.
      expect(resizes.length).toBeLessThanOrEqual(1)
      if (resizes.length) expect(resizes[0][0]).toBe(label)
    })

    it('refreshes the external label only once per commandStack.changed', () => {
      const callbacks = new Map(), changes = []
      const businessObject = { $type: type, name: 'Occurrence' }
      const shape = { id: 'ref', businessObject }
      const label = { id: 'ref_label', labelTarget: shape, businessObject }
      shape.label = label
      OccurrenceLabelRefresh(
        { on: (name, priority, cb) => callbacks.set(name, cb),
          fire: (name, event) => changes.push([name, event.element]) },
        { filter: predicate => [ shape, label ].filter(predicate), get: () => null },
        {}, {}, { get: () => [] }
      )
      callbacks.get('commandStack.changed')()
      expect(changes.filter(([name]) => name === 'element.changed')).toEqual([['element.changed', label]])
    })
  })
}

for (const type of [ 'bpmn:DataObjectReference', 'bpmn:DataStoreReference' ]) {
  describe(`${type}: native label deletion`, () => {
    it('does not recreate during native label removal, but allows normal updates', () => {
      const callbacks = new Map(), creates = []
      const key = type === 'bpmn:DataStoreReference' ? 'dataStoreRef' : 'dataObjectRef'
      const businessObject = { $type: type, name: '', [key]: { name: 'Master' } }
      const shape = { id: 'ref', parent: {}, businessObject, x: 20, y: 20, width: 40, height: 40 }
      OccurrenceLabelMaterialization(
        { on: (event, priority, callback) => callbacks.set(event, callback) },
        { filter: () => [ shape ], get: () => null },
        { createLabel: (...args) => creates.push(args), resizeShape: () => {} },
        { getExternalLabelBounds: () => ({ width: 80, height: 20 }) }
      )
      const callback = callbacks.get('commandStack.element.updateLabel.postExecuted')
      callback({ context: { element: shape, newLabel: null, hints: { removeShape: false } } })
      expect(creates).toHaveLength(0)
      callback({ context: { element: shape, newLabel: 'New Name' } })
      expect(creates).toHaveLength(1)
    })
  })
}
