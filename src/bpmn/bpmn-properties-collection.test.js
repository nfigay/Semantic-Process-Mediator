import { describe, it, expect } from 'vitest'
import { BpmnModdle } from 'bpmn-moddle'
import { supportsBpmnProperties, addBpmnProperty, renameBpmnProperty,
  removeBpmnProperty, isBpmnPropertyReferenced } from './bpmn-properties-collection.js'

const moddle = new BpmnModdle()
const factory = { create: (type, attrs) => moddle.create(type, attrs) }
const registry = { get: () => undefined }
function fixture() {
  const bo = moddle.create('bpmn:Task', { id: 'Task_1', properties: [] })
  const element = { businessObject: bo }
  const modeling = {
    updateProperties: (_, attrs) => Object.assign(bo, attrs),
    updateModdleProperties: (_, target, attrs) => Object.assign(target, attrs)
  }
  return { bo, element, modeling }
}
describe('PROP-007H BPMN Property collection', () => {
  it('uses the BPMN descriptor for eligibility', () => {
    expect(supportsBpmnProperties(moddle, 'bpmn:Task')).toBe(true)
    expect(supportsBpmnProperties(moddle, 'bpmn:SequenceFlow')).toBe(false)
  })
  it('adds, renames and removes an unreferenced property', async () => {
    const { bo, element, modeling } = fixture()
    const property = addBpmnProperty(element, modeling, factory, registry)
    renameBpmnProperty(element, property, 'Context', modeling)
    expect(bo.get('properties')).toContain(property)
    expect(property.name).toBe('Context')
    const xml = await moddle.toXML(moddle.create('bpmn:Definitions', {
      id: 'Definitions_1', rootElements: [moddle.create('bpmn:Process', { id: 'Process_1', flowElements: [bo] })]
    }))
    expect(xml.xml).toContain('Context')
    expect(removeBpmnProperty(element, property, modeling)).toBe(true)
    expect(bo.get('properties')).toHaveLength(0)
  })
  it('refuses removal when referenced by an association', () => {
    const { bo, element, modeling } = fixture()
    const property = addBpmnProperty(element, modeling, factory, registry)
    bo.dataInputAssociations = [moddle.create('bpmn:DataInputAssociation', {
      id: 'Association_1', sourceRef: [property]
    })]
    expect(isBpmnPropertyReferenced(element, property)).toBe(true)
    expect(() => removeBpmnProperty(element, property, modeling)).toThrow(/referenced/)
    expect(bo.get('properties')).toContain(property)
  })
})
