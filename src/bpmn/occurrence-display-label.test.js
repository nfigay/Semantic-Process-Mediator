import { describe, it, expect } from 'vitest'
import { getOccurrenceDisplayLabel } from './occurrence-display-label.js'

describe('BPMN occurrence presentation label — import matrix', () => {
  for (const [ type, link ] of [
    [ 'bpmn:DataObjectReference', 'dataObjectRef' ],
    [ 'bpmn:DataStoreReference', 'dataStoreRef' ]
  ]) {
    it(`${type}: prioritizes the reference name over the master`, () => {
      const bo = { $type: type, name: 'Commande à traiter', [link]: { name: 'Commande' }, dataState: { name: 'Validée' } }
      expect(getOccurrenceDisplayLabel(bo)).toBe('Commande à traiter')
      expect(bo.name).toBe('Commande à traiter')
      expect(bo[link].name).toBe('Commande')
    })
    it(`${type}: explicit name is stable if master/state changes`, () => {
      const bo = { $type: type, name: 'Alias', [link]: { name: 'Master' }, dataState: { name: 'draft' } }
      expect(getOccurrenceDisplayLabel(bo)).toBe('Alias')
      bo[link].name = 'Renamed'
      bo.dataState.name = 'release'
      expect(getOccurrenceDisplayLabel(bo)).toBe('Alias')
    })
    it(`${type}: falls back to the master name`, () => {
      const bo = { $type: type, name: '', [link]: { name: 'Commande' }, dataState: { name: 'Validée' } }
      expect(getOccurrenceDisplayLabel(bo)).toBe('Commande [Validée]')
      expect(getOccurrenceDisplayLabel({ ...bo, dataState: null })).toBe('Commande')
      expect(bo.name).toBe('')
    })
    it(`${type}: handles missing names and explicit names without duplicate state`, () => {
      const bo = { $type: type, name: 'Commande [Validée]', [link]: { name: 'Commande' }, dataState: { name: 'Validée' } }
      expect(getOccurrenceDisplayLabel(bo)).toBe('Commande [Validée]')
      expect(getOccurrenceDisplayLabel({ ...bo, name: '' , [link]: { name: '' } })).toBe('[Validée]')
      expect(getOccurrenceDisplayLabel({ ...bo, name: '', [link]: { name: '' }, dataState: null })).toBe('')
      expect(getOccurrenceDisplayLabel({ ...bo, name: 'Commande', dataState: null })).toBe('Commande')
    })
    it(`${type}: does not force uniqueness of legitimate repeated labels`, () => {
      const bo1 = { $type: type, name: 'Commande', dataState: null }
      const bo2 = { $type: type, name: 'Commande', dataState: null }
      expect(getOccurrenceDisplayLabel(bo1)).toBe(getOccurrenceDisplayLabel(bo2))
    })
  }
  it('leaves unrelated BPMN elements unchanged', () => {
    expect(getOccurrenceDisplayLabel({ $type: 'bpmn:Task', name: 'A', dataState: { name: 'draft' } })).toBe('A')
  })
})
