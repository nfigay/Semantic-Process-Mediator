/** Unified BPMN standard extensions; native bpmn.io provider remains authoritative. */
import { h } from 'preact'
import { appendIoStructureGroup } from './bpmn-io-structure-panel.js'
import { decorateNativeEntries } from './bpmn-native-inheritance.js'
import { TextFieldEntry, CheckboxEntry, SelectEntry, isTextFieldEntryEdited, isCheckboxEntryEdited, isSelectEntryEdited } from '@bpmn-io/properties-panel'
import { useService } from 'bpmn-js-properties-panel'
import { inheritedPropertyLabel } from './bpmn-property-inheritance.js'
import { collectScalarProperties, scalarValueToModdle } from './bpmn-standard-scalar.js'
import { propertyCoverage } from './bpmn-standard-coverage.js'

function withOrigin(Component, origin) {
  return function NativeWithOrigin(props) {
    return h('div', { class: 'bpmns-native-inheritance' },
      h(Component, props),
      h('small', { class: 'bpmns-native-inheritance-origin', style: { display: 'block', fontSize: '11px', opacity: '0.75', marginTop: '2px' } }, origin))
  }
}

const STANDARD_ENTRIES = [ { type: 'bpmn:SequenceFlow', property: 'conditionExpression' } ]

function ConditionEntry({ element, id }) {
  const modeling = useService('modeling')
  const bpmnFactory = useService('bpmnFactory')
  const debounce = useService('debounceInput')
  const bo = element.businessObject
  return TextFieldEntry({ element, id, label: 'Condition Expression',
    getValue: () => bo.conditionExpression?.body || '',
    setValue: value => {
      const expression = bo.conditionExpression
      if (expression) modeling.updateModdleProperties(element, expression, { body: value || undefined })
      else if (value) modeling.updateProperties(element, { conditionExpression: bpmnFactory.create('bpmn:FormalExpression', { body: value }) })
    }, debounce })
}

function makeScalarEntry(property, kind, label, enumValues) {
  return function ScalarEntry({ element, id }) {
    const modeling = useService('modeling')
    const debounce = useService('debounceInput')
    const bo = element.businessObject
    const getValue = () => bo.get ? bo.get(property.name) : bo[property.name]
    const setValue = value => {
      const normalized = scalarValueToModdle(kind, value)
      if (normalized === null) return // invalid number: never corrupt the model
      modeling.updateProperties(element, { [property.name]: normalized })
    }
    if (kind === 'Boolean') return CheckboxEntry({ element, id, label, getValue: () => Boolean(getValue()), setValue })
    if (kind === 'Enum') return SelectEntry({ element, id, label,
      getValue: () => getValue() || '', setValue,
      getOptions: () => [ { value: '', label: '' }, ...enumValues.map(value => ({ value, label: value })) ] })
    return TextFieldEntry({ element, id, label,
      getValue: () => String(getValue() ?? ''), setValue, debounce })
  }
}

export function BpmnStandardProperties(propertiesPanel, moddle) {
  this.moddle = moddle
  propertiesPanel.registerProvider(600, this)
}
BpmnStandardProperties.$inject = [ 'propertiesPanel', 'moddle' ]
BpmnStandardProperties.prototype.getGroups = function(element) {
  return groups => {
    const type = element?.businessObject?.$type
    if (!type) return groups
    const next = decorateNativeEntries([ ...groups ], this.moddle, type, inheritedPropertyLabel, withOrigin)
    if (STANDARD_ENTRIES.some(item => item.type === type && item.property === 'conditionExpression') && !next.some(g => g.entries?.some(e => e.id === 'bpmns-condition-expression'))) {
      next.push({ id: 'bpmns-condition', label: 'Flow Condition', entries: [ {
        id: 'bpmns-condition-expression', element, component: ConditionEntry,
        isEdited: isTextFieldEntryEdited, semanticProperty: 'conditionExpression',
        inheritedLabel: inheritedPropertyLabel(this.moddle, type, 'conditionExpression')
      } ] })
    }
    const entries = []
    for (const { property, kind, options: values, status } of propertyCoverage(this.moddle, type, next, collectScalarProperties)) {
      if (status !== 'GENERATED') continue
      const inherited = inheritedPropertyLabel(this.moddle, type, property.name)
      const label = `${property.name}${inherited ? ` ${inherited}` : ''}`
      entries.push({ id: `bpmns-standard-${property.name}`, element,
        semanticProperty: property.name,
        component: makeScalarEntry(property, kind, label, values),
        isEdited: kind === 'Boolean' ? isCheckboxEntryEdited : kind === 'Enum' ? isSelectEntryEdited : isTextFieldEntryEdited })
    }
    if (entries.length) next.push({ id: 'bpmns-standard-scalars', label: 'BPMN standard attributes', entries })
    return appendIoStructureGroup(next, element, this.moddle)
  }
}
export default { __init__: [ 'bpmnStandardProperties' ], bpmnStandardProperties: [ 'type', BpmnStandardProperties ] }
