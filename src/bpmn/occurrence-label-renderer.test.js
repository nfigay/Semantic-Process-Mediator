import { describe, it, expect } from 'vitest'
import { OccurrenceLabelRenderer } from './occurrence-label-renderer.js'

describe('occurrence label renderer selection — DataObject/DataStore parity', () => {
  for (const [ type, refKey ] of [
    [ 'bpmn:DataObjectReference', 'dataObjectRef' ],
    [ 'bpmn:DataStoreReference', 'dataStoreRef' ]
  ]) {
    const canRender = bo => OccurrenceLabelRenderer.prototype.canRender({ labelTarget: { businessObject: bo } })

    it(`${type}: renders imported reference names without state`, () => {
      expect(canRender({ $type: type, name: 'Instance A' })).toBe(true)
    })
    it(`${type}: renders fallback master names without state, when label shape exists`, () => {
      expect(canRender({ $type: type, name: '', [refKey]: { name: 'Master A' } })).toBe(true)
    })
    it(`${type}: renders state-only labels but leaves empty labels native`, () => {
      expect(canRender({ $type: type, name: '', dataState: { name: 'Ready' } })).toBe(true)
      expect(canRender({ $type: type, name: '', dataState: null })).toBe(false)
    })
  }
  it('does not intercept other element labels', () => {
    const canRender = bo => OccurrenceLabelRenderer.prototype.canRender({ labelTarget: { businessObject: bo } })
    expect(canRender({ $type: 'bpmn:Task', name: 'Task' })).toBe(false)
  })
  it('does not intercept shapes with no label target', () => {
    expect(OccurrenceLabelRenderer.prototype.canRender({ businessObject: { $type: 'bpmn:DataObjectReference' } })).toBe(false)
  })
})
