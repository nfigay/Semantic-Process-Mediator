import { describe, it, expect, vi } from 'vitest'
import { ioItemIsReferenced, removeIoItem } from './bpmn-io-structure.js'

describe('PROP-007C referenced IO protection', () => {
  it('rejects deletion of an input referenced by an association', () => {
    const item = { id: 'Input_1' }
    const element = { businessObject: {
      dataInputAssociations: [{ targetRef: item }],
      ioSpecification: { get: () => [item] }
    } }
    const modeling = { updateModdleProperties: vi.fn() }
    expect(ioItemIsReferenced(element, 'input', item)).toBe(true)
    expect(() => removeIoItem(element, 'input', item, modeling)).toThrow(/referenced/)
    expect(modeling.updateModdleProperties).not.toHaveBeenCalled()
  })
  it('rejects deletion of an output referenced by an association', () => {
    const item = { id: 'Output_1' }
    const element = { businessObject: {
      dataOutputAssociations: [{ sourceRef: [item] }],
      ioSpecification: { get: () => [item] }
    } }
    expect(ioItemIsReferenced(element, 'output', item)).toBe(true)
    expect(() => removeIoItem(element, 'output', item, { updateModdleProperties: vi.fn() })).toThrow(/referenced/)
  })
})
