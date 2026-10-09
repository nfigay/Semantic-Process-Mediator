import { describe, it, expect } from 'vitest'
import { BpmnModdle } from 'bpmn-moddle'
import { addIoItem } from './bpmn-io-structure.js'
import { addIoSet, removeIoSet, ioSets, setIoSetMembership, ioSetMembership } from './bpmn-io-sets.js'
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
describe('PROP-007D IO sets and references', () => {
  it('creates sets, edits membership, preserves XML references', async () => {
    const { element, modeling } = setup()
    const input = addIoItem(element, 'input', modeling, factory)
    const output = addIoItem(element, 'output', modeling, factory)
    const second = addIoSet(element, 'input', modeling, factory)
    expect(ioSets(element, 'input')).toHaveLength(2)
    expect(ioSetMembership(second, 'input', input)).toBe(false)
    setIoSetMembership(element, 'input', second, input, true, modeling)
    setIoSetMembership(element, 'input', second, input, true, modeling)
    expect(second.dataInputRefs).toEqual([input])
    const definitions = moddle.create('bpmn:Definitions', {
      id: 'Definitions_1', rootElements: [moddle.create('bpmn:Process', {
        id: 'Process_1', flowElements: [element.businessObject]
      })]
    })
    const { xml } = await moddle.toXML(definitions)
    const { rootElement } = await moddle.fromXML(xml)
    const task = rootElement.rootElements[0].flowElements[0]
    expect(task.ioSpecification.inputSets).toHaveLength(2)
    expect(task.ioSpecification.inputSets[1].dataInputRefs[0].id).toBe(input.id)
    expect(task.ioSpecification.outputSets[0].dataOutputRefs[0].id).toBe(output.id)
    setIoSetMembership(element, 'input', second, input, false, modeling)
    expect(second.dataInputRefs).toHaveLength(0)
    expect(removeIoSet(element, 'input', second, modeling)).toBe(true)
    expect(() => removeIoSet(element, 'input', ioSets(element, 'input')[0], modeling)).toThrow(/At least one/)
  })
  it('rejects references to an item from another specification', () => {
    const { element, modeling } = setup()
    addIoItem(element, 'input', modeling, factory)
    const set = ioSets(element, 'input')[0]
    expect(() => setIoSetMembership(element, 'input', set, { id: 'Other' }, true, modeling)).toThrow(/not part/)
  })
})
