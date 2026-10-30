import { describe, it, expect } from 'vitest'
import { OccurrenceLabelRefresh } from './occurrence-label-refresh.js'

for (const [type, key] of [
  [ 'bpmn:DataObjectReference', 'dataObjectRef' ],
  [ 'bpmn:DataStoreReference', 'dataStoreRef' ]
]) {
  describe(`${type} — focus-safe display refresh`, () => {
    it('does not invoke modeling on successive Name changes', () => {
      const callbacks = new Map()
      const events = []
      const label = { id: 'ref_label' }
      const bo = { $type: type, name: '', [key]: { name: 'Master' }, dataState: { name: 'draft' } }
      const element = { id: 'ref', businessObject: bo, label }
      const modeling = { resizeShape: () => { throw Error('must not model during typing') } }
      OccurrenceLabelRefresh({
        on: (event, priority, callback) => callbacks.set(event, callback),
        fire: (event, data) => events.push({ event, data })
      }, { filter: callback => [element].filter(callback), get: () => null },
      modeling, {}, { get: () => [element] })
      callbacks.get('commandStack.changed')()
      bo.name = 'N'
      callbacks.get('commandStack.changed')()
      bo.name = 'Na'
      callbacks.get('commandStack.changed')()
      expect(events.filter(e => e.event === 'bpmnsm.occurrenceDisplayLabel.changed')
        .map(e => e.data.value)).toEqual([ 'Master [draft]', 'N', 'Na' ])
      expect(events.filter(e => e.event === 'element.changed')).toHaveLength(3)
    })
  })
}
