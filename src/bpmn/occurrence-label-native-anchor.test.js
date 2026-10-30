import { describe, it, expect, vi } from 'vitest'

vi.mock('bpmn-js/lib/util/LabelUtil.js', () => ({
  getExternalLabelMid: () => ({ x: 120, y: 160 })
}))

import { OccurrenceLabelMaterialization } from './occurrence-label-materialization.js'

for (const type of ['bpmn:DataObjectReference', 'bpmn:DataStoreReference']) {
  it(`${type}: uses BPMN native anchor for initial label and correcting stale geometry`, () => {
    const callbacks = new Map()
    const ref = {
      id: 'Ref_1', x: 20, y: 30, width: 40, height: 50,
      parent: {}, businessObject: {
        $type: type, name: '', dataState: { name: 'draft' },
        [type === 'bpmn:DataObjectReference' ? 'dataObjectRef' : 'dataStoreRef']: { name: 'test' }
      }
    }
    const placements = [], resizes = []
    const modeling = {
      createLabel(_el, position, options) {
        placements.push(position)
        ref.label = { x: position.x - options.width / 2, y: position.y - options.height / 2,
          width: options.width, height: options.height }
      },
      resizeShape(_label, bounds) { resizes.push(bounds); Object.assign(ref.label, bounds) }
    }
    OccurrenceLabelMaterialization(
      { on: (event, _priority, fn) => callbacks.set(event, fn) },
      { filter: fn => [ref].filter(fn), get: () => ref.label },
      modeling,
      { getExternalLabelBounds: (_box, text) => ({ x: 0, y: 0, width: text.length * 8, height: 20 }) }
    )
    callbacks.get('commandStack.shape.create.postExecuted')({ context: { shape: ref } })
    expect(placements).toEqual([{ x: 120, y: 167 }])
    ref.label.x += 200
    callbacks.get('commandStack.element.updateLabel.postExecuted')({ context: { element: ref } })
    expect(resizes).toHaveLength(1)
    expect(ref.label.x + ref.label.width / 2).toBe(120)
    expect(ref.label.y + ref.label.height / 2).toBe(167)
    expect(ref.businessObject.name).toBe('')
  })
}
