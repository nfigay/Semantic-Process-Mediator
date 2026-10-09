import { describe, it, expect } from 'vitest'
import { BpmnModdle } from 'bpmn-moddle'
import { addIoItem } from './bpmn-io-structure.js'
import { addDataAssociation, setAssociationSourceMembership, addAssociationAssignment, removeAssociationAssignment, setAssignmentExpression } from './bpmn-data-associations.js'
const moddle = new BpmnModdle()
const factory = { create: (type, attrs) => moddle.create(type, attrs) }
const modeling = {
  updateProperties: (element, attrs) => Object.assign(element.businessObject, attrs),
  updateModdleProperties: (_element, object, attrs) => Object.assign(object, attrs)
}
describe('PROP-007F multi-source and assignments', () => {
  it('preserves multiple sources and assignment expressions in BPMN XML', async () => {
    const task = moddle.create('bpmn:Task', { id: 'Task_1' })
    const element = { businessObject: task }
    addIoItem(element, 'input', modeling, factory)
    const a = moddle.create('bpmn:DataObjectReference', { id: 'DataRef_A' })
    const b = moddle.create('bpmn:DataObjectReference', { id: 'DataRef_B' })
    const registry = { getAll: () => [{ businessObject: a }, { businessObject: b }] }
    const association = addDataAssociation(element, 'input', modeling, factory)
    expect(setAssociationSourceMembership(element, 'input', association, a, true, modeling, registry)).toBe(true)
    expect(setAssociationSourceMembership(element, 'input', association, b, true, modeling, registry)).toBe(true)
    expect(association.sourceRef).toEqual([a, b])
    const assignment = addAssociationAssignment(element, 'input', association, modeling, factory)
    setAssignmentExpression(element, 'input', association, assignment, 'from', 'source.value', modeling, factory)
    setAssignmentExpression(element, 'input', association, assignment, 'to', 'target.value', modeling, factory)
    const process = moddle.create('bpmn:Process', { id: 'Process_1', flowElements: [a, b, task] })
    const definitions = moddle.create('bpmn:Definitions', { id: 'Definitions_1', rootElements: [process] })
    const { xml } = await moddle.toXML(definitions)
    const { rootElement, warnings } = await moddle.fromXML(xml)
    expect(warnings).toHaveLength(0)
    const parsed = rootElement.rootElements[0].flowElements.find(item => item.id === 'Task_1').dataInputAssociations[0]
    expect(parsed.sourceRef.map(item => item.id)).toEqual(['DataRef_A', 'DataRef_B'])
    expect(parsed.assignment[0].from.body).toBe('source.value')
    expect(parsed.assignment[0].to.body).toBe('target.value')
    expect(setAssociationSourceMembership(element, 'input', association, a, false, modeling, registry)).toBe(true)
    expect(association.sourceRef).toEqual([b])
    expect(removeAssociationAssignment(element, 'input', association, assignment, modeling)).toBe(true)
    expect(association.assignment).toHaveLength(0)
  })
  it('rejects references outside candidates and foreign assignments', () => {
    const element = { businessObject: moddle.create('bpmn:Task', { id: 'Task_2' }) }
    addIoItem(element, 'input', modeling, factory)
    const association = addDataAssociation(element, 'input', modeling, factory)
    expect(() => setAssociationSourceMembership(element, 'input', association, { id: 'Unknown' }, true, modeling)).toThrow(/not a permitted/)
    expect(() => setAssignmentExpression(element, 'input', association, factory.create('bpmn:Assignment'), 'from', 'x', modeling, factory)).toThrow(/does not belong/)
  })
})
