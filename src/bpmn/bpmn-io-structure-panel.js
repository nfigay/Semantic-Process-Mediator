import { appendBpmnPropertiesGroup } from './bpmn-properties-collection-panel.js'
import { appendDataAssociationsGroup } from './bpmn-data-associations-panel.js'
import { appendIoSetsGroup } from './bpmn-io-sets-panel.js'
import { h } from 'preact'
import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel'
import { useService } from 'bpmn-js-properties-panel'
import { supportsIoSpecification, addIoItem, removeIoItem, renameIoItem, ioItemIsReferenced } from './bpmn-io-structure.js'

function IoNameEntry({ element, id, item }) {
  const modeling = useService('modeling')
  const debounce = useService('debounceInput')
  return TextFieldEntry({
    element, id, label: item.id || 'Name',
    getValue: () => item.name || '',
    setValue: value => renameIoItem(element, item, value, modeling),
    debounce
  })
}

function IoStructureEntry({ element }) {
  const modeling = useService('modeling')
  const factory = useService('bpmnFactory')
  const registry = useService('elementRegistry')
  const io = element.businessObject.ioSpecification
  const children = []
  for (const [kind, key] of [['input', 'dataInputs'], ['output', 'dataOutputs']]) {
    const items = io?.get(key) || []
    children.push(h('div', { key: kind, class: 'bpmns-io-kind' },
      h('strong', null, kind === 'input' ? 'Data inputs' : 'Data outputs'),
      ...items.map(item => {
        const referenced = ioItemIsReferenced(element, kind, item)
        return h('div', { key: item.id, class: 'bpmns-io-item' },
          h(IoNameEntry, { element, item, id: `bpmns-io-name-${item.id}` }),
          h('button', {
            type: 'button', disabled: referenced,
            title: referenced ? 'Referenced by a data association; remove the association first' : 'Remove',
            onClick: () => removeIoItem(element, kind, item, modeling)
          }, 'Remove')
        )
      }),
      h('button', { type: 'button', onClick: () => addIoItem(element, kind, modeling, factory, registry) },
        kind === 'input' ? 'Add data input' : 'Add data output')
    ))
  }
  return h('div', { class: 'bpmns-io-structure' }, ...children)
}

export function appendIoStructureGroup(groups, element, moddle) {
  const type = element?.businessObject?.$type
  if (!supportsIoSpecification(moddle, type)) return appendBpmnPropertiesGroup(groups, element, moddle)
  if (groups.some(group => group.id === 'bpmns-io-structure')) return groups
  return appendBpmnPropertiesGroup(appendDataAssociationsGroup(appendIoSetsGroup([...groups, {
    id: 'bpmns-io-structure', label: 'BPMN input / output specification',
    entries: [{ id: 'bpmns-io-structure-entry', element, component: IoStructureEntry,
      isEdited: isTextFieldEntryEdited }]
  }], element), element), element, moddle)
}
