import { describe, it, expect } from 'vitest'
import { BpmnModdle } from 'bpmn-moddle'
import { addIoItem } from './bpmn-io-structure.js'
import { addDataAssociation, setAssociationSourceMembership } from './bpmn-data-associations.js'

const moddle = new BpmnModdle()
const factory = { create: (type, attrs) => moddle.create(type, attrs) }
const modeling = {
  updateProperties: (element, attrs) => Object.assign(element.businessObject, attrs),
  updateModdleProperties: (_element, object, attrs) => Object.assign(object, attrs)
}

describe('PROP-007G source integrity', () => {
  it('does not reorder or duplicate an already selected source', () => {
    const element = { businessObject: moddle.create('bpmn:Task', { id: 'Task_G1' }) }
    addIoItem(element, 'input', modeling, factory)
    const a = moddle.create('bpmn:DataObjectReference', { id: 'Data_GA' })
    const b = moddle.create('bpmn:DataObjectReference', { id: 'Data_GB' })
    const registry = { getAll: () => [{ businessObject: a }, { businessObject: b }] }
    const association = addDataAssociation(element, 'input', modeling, factory)
    expect(setAssociationSourceMembership(element, 'input', association, a, true, modeling, registry)).toBe(true)
    expect(setAssociationSourceMembership(element, 'input', association, b, true, modeling, registry)).toBe(true)
    expect(setAssociationSourceMembership(element, 'input', association, a, true, modeling, registry)).toBe(false)
    expect(association.sourceRef).toEqual([a, b])
  })
  it('allows removal of an orphaned source but rejects adding an unlisted source', () => {
    const element = { businessObject: moddle.create('bpmn:Task', { id: 'Task_G2' }) }
    addIoItem(element, 'input', modeling, factory)
    const old = moddle.create('bpmn:DataObjectReference', { id: 'Data_Former' })
    const association = addDataAssociation(element, 'input', modeling, factory)
    association.sourceRef = [old]
    const emptyRegistry = { getAll: () => [] }
    expect(() => setAssociationSourceMembership(element, 'input', association, old, true, modeling, emptyRegistry)).toThrow(/not a permitted/)
    expect(setAssociationSourceMembership(element, 'input', association, old, false, modeling, emptyRegistry)).toBe(true)
    expect(association.sourceRef).toEqual([])
    expect(setAssociationSourceMembership(element, 'input', association, old, false, modeling, emptyRegistry)).toBe(false)
  })
})
