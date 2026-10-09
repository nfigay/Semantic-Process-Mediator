import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel'
import { useService } from 'bpmn-js-properties-panel'

function ConditionEntry(props) {
  const { element, id } = props
  const modeling = useService('modeling')
  const bpmnFactory = useService('bpmnFactory')
  const debounce = useService('debounceInput')
  const bo = element.businessObject
  return TextFieldEntry({
    element, id, label: 'Condition Expression',
    getValue: () => bo.conditionExpression?.body || '',
    setValue: value => {
      const expression = bo.conditionExpression
      if (expression) {
        modeling.updateModdleProperties(element, expression, { body: value || undefined })
      } else if (value) {
        modeling.updateProperties(element, {
          conditionExpression: bpmnFactory.create('bpmn:FormalExpression', { body: value })
        })
      }
    },
    debounce
  })
}

export function SequenceFlowConditionProperties(propertiesPanel) {
  propertiesPanel.registerProvider(600, this)
}
SequenceFlowConditionProperties.$inject = [ 'propertiesPanel' ]
SequenceFlowConditionProperties.prototype.getGroups = function(element) {
  return groups => {
    if (element?.businessObject?.$type !== 'bpmn:SequenceFlow') return groups
    // A dedicated group avoids replacing or modifying the native provider.
    return [ ...groups, {
      id: 'bpmns-condition', label: 'Flow Condition', entries: [ {
        id: 'bpmns-condition-expression', element,
        component: ConditionEntry,
        isEdited: isTextFieldEntryEdited
      } ]
    } ]
  }
}
export default {
  __init__: [ 'sequenceFlowConditionProperties' ],
  sequenceFlowConditionProperties: [ 'type', SequenceFlowConditionProperties ]
}
