import { describe, it, expect } from 'vitest'
import { BpmnModdle } from 'bpmn-moddle'
import { supportsIoSpecification, addIoItem, removeIoItem } from './bpmn-io-structure.js'

const moddle = new BpmnModdle()
const factory = { create: (type, attrs) => moddle.create(type, attrs) }
function setup() {
  const element = { businessObject: moddle.create('bpmn:Task', { id: 'Task_1' }) }
  const modeling = {
    updateProperties: (el, values) => Object.assign(el.businessObject, values),
    updateModdleProperties: (_el, target, values) => Object.assign(target, values)
  }
  return { element, modeling }
}
describe('PROP-007B IO structures', () => {
  it('checks type support', () => {
    expect(supportsIoSpecification(moddle, 'bpmn:Task')).toBe(true)
    expect(supportsIoSpecification(moddle, 'bpmn:SequenceFlow')).toBe(false)
  })
  it('adds and removes input and output with set references', async () => {
    const { element, modeling } = setup()
    const input = addIoItem(element, 'input', modeling, factory)
    const output = addIoItem(element, 'output', modeling, factory)
    const io = element.businessObject.ioSpecification
    expect(io.dataInputs).toContain(input)
    expect(io.inputSets[0].dataInputRefs).toContain(input)
    expect(io.outputSets[0].dataOutputRefs).toContain(output)
    const xml = await moddle.toXML(moddle.create('bpmn:Definitions', {
      id: 'Definitions_1', rootElements: [moddle.create('bpmn:Process', {
        id: 'Process_1', flowElements: [element.businessObject]
      })]
    }))
    expect(xml.xml).toContain('dataInput')
    const roundtrip = await moddle.fromXML(xml.xml)
    const task = roundtrip.rootElement.rootElements[0].flowElements[0]
    expect(task.ioSpecification.dataInputs).toHaveLength(1)
    expect(task.ioSpecification.inputSets[0].dataInputRefs).toHaveLength(1)
    removeIoItem(element, 'input', input, modeling)
    expect(io.dataInputs).toHaveLength(0)
    expect(io.inputSets[0].dataInputRefs).toHaveLength(0)
  })
})
