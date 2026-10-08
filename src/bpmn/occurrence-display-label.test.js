import { describe, it, expect } from 'vitest'
import { getOccurrenceDisplayLabel } from './occurrence-display-label.js'

describe('BPMN occurrence presentation label', () => {
  for (const type of [ 'bpmn:DataObjectReference', 'bpmn:DataStoreReference' ]) {
    it(`${type}: shows name and state without mutating semantic data`, () => {
      const bo = { $type: type, name: 'Titi', dataState: { name: 'draft' } }
      expect(getOccurrenceDisplayLabel(bo)).toBe('Titi [draft]')
      expect(bo.name).toBe('Titi')
      expect(bo.dataState.name).toBe('draft')
      expect(getOccurrenceDisplayLabel({ ...bo, dataState: null })).toBe('Titi')
      expect(getOccurrenceDisplayLabel({ ...bo, name: '' })).toBe('[draft]')
    })
  }
  it('leaves unrelated BPMN elements unchanged', () => {
    expect(getOccurrenceDisplayLabel({ $type: 'bpmn:Task', name: 'A', dataState: { name: 'draft' } })).toBe('A')
  })
})
