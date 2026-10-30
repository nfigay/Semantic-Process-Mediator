import { describe, it, expect } from 'vitest'
import module from './data-store-occurrence-context-pad-module.js'

function scenario(type) {
  let provider
  let preExecute
  let created
  const master = { id: 'Master_1', name: 'Shared' }
  const refKey = type === 'bpmn:DataObjectReference' ? 'dataObjectRef' : 'dataStoreRef'
  const source = { x: 10, y: 20, width: 100, height: 50, parent: {},
    businessObject: { $type: type, [refKey]: master, name: 'Old name', dataState: { name: 'draft' } } }
  const Ctor = module.semarchDataStoreOccurrenceContextPadProvider[1]
  new Ctor(
    { registerProvider: p => { provider = p } },
    { start: () => {} },
    { createShape: shape => { created = shape } },
    { createShape: properties => ({ ...properties, width: 60, height: 50 }) },
    { create: (kind, props) => ({ $type: kind, ...props }) },
    text => text,
    { on: (name, priority, handler) => {
      if (name === 'commandStack.shape.create.preExecute') {
        expect(priority).toBeLessThan(1000)
        preExecute = handler
      }
    } }
  )
  const action = Object.values(provider.getContextPadEntries(source))[0].action
  action.click({}, source)
  return { master, refKey, created, preExecute }
}

describe('occurrence master identity at BPMN command boundary', () => {
  it('DataObject restores the reused master after native preExecute overwrites it', () => {
    const { master, created, preExecute } = scenario('bpmn:DataObjectReference')
    const nativeFreshMaster = { id: 'Wrong_New_Master' }
    created.businessObject.dataObjectRef = nativeFreshMaster
    preExecute({ context: { shape: created } })
    expect(created.businessObject.dataObjectRef).toBe(master)
    expect(created.businessObject.name).toBeUndefined()
    expect(created.businessObject.dataState).toBeUndefined()
  })
  it('DataStore shares its master unchanged', () => {
    const { master, created } = scenario('bpmn:DataStoreReference')
    expect(created.businessObject.dataStoreRef).toBe(master)
  })
  it('new DataObject without reuse marker is not altered', () => {
    const { preExecute } = scenario('bpmn:DataObjectReference')
    const fresh = { $type: 'bpmn:DataObjectReference', dataObjectRef: { id: 'Fresh' } }
    preExecute({ context: { shape: { businessObject: fresh } } })
    expect(fresh.dataObjectRef.id).toBe('Fresh')
  })
})
