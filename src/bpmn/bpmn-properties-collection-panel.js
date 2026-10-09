import { h } from 'preact'
import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel'
import { useService } from 'bpmn-js-properties-panel'
import {
  supportsBpmnProperties, bpmnProperties, addBpmnProperty,
  renameBpmnProperty, removeBpmnProperty, isBpmnPropertyReferenced
} from './bpmn-properties-collection.js'

function PropertyNameEntry({ element, property, id }) {
  const modeling = useService('modeling')
  const debounce = useService('debounceInput')
  return TextFieldEntry({ element, id, label: property.id,
    getValue: () => property.name || '',
    setValue: value => renameBpmnProperty(element, property, value, modeling), debounce })
}

function PropertiesCollectionEntry({ element }) {
  const modeling = useService('modeling')
  const factory = useService('bpmnFactory')
  const registry = useService('elementRegistry')
  return h('div', { class: 'bpmns-properties-collection' },
    ...bpmnProperties(element).map(property => {
      const referenced = isBpmnPropertyReferenced(element, property, registry)
      return h('div', { key: property.id },
        h(PropertyNameEntry, { element, property, id: `bpmns-property-${property.id}` }),
        h('button', { type: 'button', disabled: referenced,
          title: referenced ? 'Referenced by a data association' : 'Remove property',
          onClick: () => removeBpmnProperty(element, property, modeling, registry) }, 'Remove'))
    }),
    h('button', { type: 'button', onClick: () => addBpmnProperty(element, modeling, factory, registry) }, 'Add property'))
}

export function appendBpmnPropertiesGroup(groups, element, moddle) {
  if (!supportsBpmnProperties(moddle, element?.businessObject?.$type)) return groups
  if (groups.some(group => group.id === 'bpmns-properties-collection')) return groups
  return [...groups, { id: 'bpmns-properties-collection', label: 'BPMN properties', entries: [
    { id: 'bpmns-properties-collection-entry', element, component: PropertiesCollectionEntry,
      isEdited: isTextFieldEntryEdited }
  ] }]
}
