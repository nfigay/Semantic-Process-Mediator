import { describe, it, expect } from 'vitest'
import { BpmnModdle } from 'bpmn-moddle'
import { addIoItem, removeIoItem } from './bpmn-io-structure.js'
import { addDataAssociation, removeDataAssociation, setDataAssociationRef } from './bpmn-data-associations.js'
const moddle = new BpmnModdle()
const factory = { create: (type, attrs) => moddle.create(type, attrs) }
function setup() {
  const element = { businessObject: moddle.create('bpmn:Task', { id: 'Task_1' }) }
  const modeling = {
    updateProperties: (el, attrs) => Object.assign(el.businessObject, attrs),
    updateModdleProperties: (_el, obj, attrs) => Object.assign(obj, attrs)
  }
  return { element, modeling }
}
describe('PROP-007E data association references', () => {
  it('serializes input and output association references through BPMN XML', async () => {
    const { element, modeling } = setup()
    const input = addIoItem(element, 'input', modeling, factory)
    const output = addIoItem(element, 'output', modeling, factory)
    const source = moddle.create('bpmn:DataObjectReference', { id: 'DataRef_1' })
    const target = moddle.create('bpmn:DataObjectReference', { id: 'DataRef_2' })
    const registry = { getAll: () => [{ businessObject: source }, { businessObject: target }] }
    const inputAssociation = addDataAssociation(element, 'input', modeling, factory)
    const outputAssociation = addDataAssociation(element, 'output', modeling, factory)
    setDataAssociationRef(element, 'input', inputAssociation, 'source', source, modeling, registry)
    setDataAssociationRef(element, 'output', outputAssociation, 'target', target, modeling, registry)
    expect(inputAssociation.targetRef).toBe(input)
    expect(outputAssociation.sourceRef).toEqual([output])
    expect(() => removeIoItem(element, 'input', input, modeling)).toThrow(/referenced/)
    const process = moddle.create('bpmn:Process', { id: 'Process_1', flowElements: [source, target, element.businessObject] })
    const definitions = moddle.create('bpmn:Definitions', { id: 'Definitions_1', rootElements: [process] })
    const { xml } = await moddle.toXML(definitions)
    const { rootElement, warnings } = await moddle.fromXML(xml)
    expect(warnings).toHaveLength(0)
    const parsed = rootElement.rootElements[0].flowElements.find(item => item.id === 'Task_1')
    expect(parsed.dataInputAssociations[0].sourceRef[0].id).toBe('DataRef_1')
    expect(parsed.dataInputAssociations[0].targetRef.id).toBe(input.id)
    expect(parsed.dataOutputAssociations[0].sourceRef[0].id).toBe(output.id)
    expect(parsed.dataOutputAssociations[0].targetRef.id).toBe('DataRef_2')
    expect(removeDataAssociation(element, 'input', inputAssociation, modeling)).toBe(true)
    expect(removeDataAssociation(element, 'output', outputAssociation, modeling)).toBe(true)
    expect(() => removeIoItem(element, 'input', input, modeling)).not.toThrow()
  })
  it('rejects a reference outside the candidate set', () => {
    const { element, modeling } = setup()
    addIoItem(element, 'input', modeling, factory)
    const association = addDataAssociation(element, 'input', modeling, factory)
    expect(() => setDataAssociationRef(element, 'input', association, 'source', { id: 'Unknown' }, modeling)).toThrow(/not a permitted/)
  })
})
