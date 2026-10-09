import { h } from 'preact'
import { CheckboxEntry, isCheckboxEntryEdited } from '@bpmn-io/properties-panel'
import { useService } from 'bpmn-js-properties-panel'
import { addIoSet, removeIoSet, ioSets, ioSetMembership, setIoSetMembership } from './bpmn-io-sets.js'

function MembershipEntry({ element, id, kind, set, item }) {
  const modeling = useService('modeling')
  return CheckboxEntry({
    element, id, label: `${item.name || item.id} (${item.id})`,
    getValue: () => ioSetMembership(set, kind, item),
    setValue: checked => setIoSetMembership(element, kind, set, item, checked, modeling)
  })
}
function IoSetsEntry({ element }) {
  const modeling = useService('modeling')
  const factory = useService('bpmnFactory')
  const registry = useService('elementRegistry')
  const io = element.businessObject.ioSpecification
  if (!io) return h('div', null, 'Add a data input or output to create an IO specification.')
  return h('div', { class: 'bpmns-io-sets' }, ...(['input', 'output'].map(kind => {
    const items = io.get(kind === 'input' ? 'dataInputs' : 'dataOutputs') || []
    const sets = ioSets(element, kind)
    return h('section', { key: kind },
      h('strong', null, kind === 'input' ? 'Input sets' : 'Output sets'),
      ...sets.map(set => h('div', { key: set.id },
        h('span', null, set.name || set.id),
        h('button', { type: 'button', disabled: sets.length <= 1,
          title: sets.length <= 1 ? 'At least one set must remain' : 'Remove set',
          onClick: () => removeIoSet(element, kind, set, modeling) }, 'Remove set'),
        ...items.map(item => h(MembershipEntry, {
          key: `${set.id}-${item.id}`, element, kind, set, item,
          id: `bpmns-io-membership-${set.id}-${item.id}`
        }))
      )),
      h('button', { type: 'button', onClick: () => addIoSet(element, kind, modeling, factory, registry) },
        kind === 'input' ? 'Add input set' : 'Add output set')
    )
  })))
}
export function appendIoSetsGroup(groups, element) {
  if (!element?.businessObject?.ioSpecification || groups.some(group => group.id === 'bpmns-io-sets')) return groups
  return [...groups, { id: 'bpmns-io-sets', label: 'BPMN input / output sets', entries: [{
    id: 'bpmns-io-sets-entry', element, component: IoSetsEntry, isEdited: isCheckboxEntryEdited
  }] }]
}
