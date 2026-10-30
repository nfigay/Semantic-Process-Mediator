import { describe, it, expect } from 'vitest'
import { OccurrenceLabelMaterialization } from './occurrence-label-materialization.js'

function harness(type) {
  const key = type === 'bpmn:DataObjectReference' ? 'dataObjectRef' : 'dataStoreRef'
  const master = { name: 'Master' }
  const bo = { $type: type, name: '', [key]: master }
  const ref = { id: 'Ref_1', x: 10, y: 10, width: 40, height: 50, parent: {}, businessObject: bo }
  const callbacks = new Map()
  const creations = [], resizes = []
  const registry = {
    get: () => ref.label,
    filter: predicate => [ref].filter(predicate)
  }
  const modeling = {
    createLabel(element, position, opts) {
      creations.push({ element, position, opts })
      ref.label = { id: opts.id, labelTarget: ref, x: position.x - opts.width / 2,
        y: position.y - opts.height / 2, width: opts.width, height: opts.height }
    },
    resizeShape(label, bounds) {
      resizes.push(bounds)
      Object.assign(label, bounds)
    }
  }
  const renderer = {
    getExternalLabelBounds: (_box, text) => ({ x: 0, y: 0, width: text.length * 9, height: 20 })
  }
  OccurrenceLabelMaterialization({ on: (name, _priority, callback) => callbacks.set(name, callback) },
    registry, modeling, renderer)
  return { bo, ref, master, callbacks, creations, resizes, registry }
}

for (const type of [ 'bpmn:DataObjectReference', 'bpmn:DataStoreReference' ]) {
  describe(`${type}: native derived-label boundaries`, () => {
    it('materializes when state is added after creation, not by copying display text into name', () => {
      const h = harness(type)
      h.bo[h.bo.$type === 'bpmn:DataObjectReference' ? 'dataObjectRef' : 'dataStoreRef'].name = ''
      h.callbacks.get('commandStack.shape.create.postExecuted')({ context: { shape: h.ref } })
      expect(h.creations).toHaveLength(0)
      h.bo.dataState = { name: 'draft' }
      h.callbacks.get('commandStack.element.updateModdleProperties.postExecuted')({
        context: { element: h.ref, moddleElement: h.bo, properties: { dataState: h.bo.dataState } }
      })
      expect(h.creations).toHaveLength(1)
      expect(h.bo.name).toBe('')
    })

    it('resizes a native label after master rename and keeps semantic name empty', () => {
      const h = harness(type)
      h.callbacks.get('import.done')({})
      expect(h.creations).toHaveLength(1)
      const previousWidth = h.ref.label.width
      h.master.name = 'A much longer master name'
      h.callbacks.get('commandStack.element.updateModdleProperties.postExecuted')({
        context: { element: h.ref, moddleElement: h.master, properties: { name: h.master.name } }
      })
      expect(h.resizes).toHaveLength(1)
      expect(h.ref.label.width).toBeGreaterThan(previousWidth)
      expect(h.bo.name).toBe('')
    })

    it('retains the label and restores derived geometry after explicit name clearing', () => {
      const h = harness(type)
      h.bo.dataState = { name: 'draft' }
      h.callbacks.get('import.done')({})
      const context = { element: h.ref, newLabel: '', hints: {} }
      h.callbacks.get('commandStack.element.updateLabel.preExecute')({ context })
      expect(context.hints.removeShape).toBe(false)
      h.bo.name = ''
      h.ref.label.width = 4
      h.callbacks.get('commandStack.element.updateLabel.postExecuted')({ context })
      expect(h.resizes).toHaveLength(1)
      expect(h.ref.label.width).toBeGreaterThan(4)
    })
  })
}
