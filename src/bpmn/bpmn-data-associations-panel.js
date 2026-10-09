import { h } from 'preact'
import { SelectEntry, CheckboxEntry, TextFieldEntry, isSelectEntryEdited } from '@bpmn-io/properties-panel'
import { useService } from 'bpmn-js-properties-panel'
import {
  dataAssociations, associationCandidates, addDataAssociation, removeDataAssociation,
  setDataAssociationRef, setAssociationSourceMembership, addAssociationAssignment,
  removeAssociationAssignment, setAssignmentExpression
} from './bpmn-data-associations.js'

function ReferenceEntry({ element, id, kind, association, role }) {
  const modeling = useService('modeling')
  const registry = useService('elementRegistry')
  const local = element.businessObject.ioSpecification?.get(kind === 'input' ? 'dataInputs' : 'dataOutputs') || []
  const candidates = role === (kind === 'input' ? 'target' : 'source')
    ? local : associationCandidates(element, kind, registry).filter(item => !local.includes(item))
  return SelectEntry({ element, id, label: `${role === 'source' ? 'Source' : 'Target'} BPMN object`,
    getValue: () => (role === 'source' ? association.sourceRef?.[0] : association.targetRef)?.id || '',
    getOptions: () => [{ value: '', label: '(none)' }, ...candidates.map(item => ({ value: item.id, label: `${item.name || item.id} (${item.id})` }))],
    setValue: value => setDataAssociationRef(element, kind, association, role, candidates.find(item => item.id === value), modeling, registry)
  })
}
function SourceMembershipEntry({ element, id, kind, association, reference }) {
  const modeling = useService('modeling')
  const registry = useService('elementRegistry')
  return CheckboxEntry({ element, id, label: `${reference.name || reference.id} (${reference.id})`,
    getValue: () => (association.sourceRef || []).includes(reference),
    setValue: value => setAssociationSourceMembership(element, kind, association, reference, Boolean(value), modeling, registry)
  })
}
function ExpressionEntry({ element, id, kind, association, assignment, side }) {
  const modeling = useService('modeling')
  const factory = useService('bpmnFactory')
  const debounce = useService('debounceInput')
  return TextFieldEntry({ element, id, label: side === 'from' ? 'From expression' : 'To expression',
    getValue: () => assignment[side]?.body || '',
    setValue: value => setAssignmentExpression(element, kind, association, assignment, side, value, modeling, factory),
    debounce
  })
}
function AssociationsEntry({ element }) {
  const modeling = useService('modeling')
  const factory = useService('bpmnFactory')
  const registry = useService('elementRegistry')
  return h('div', { class: 'bpmns-data-associations' }, ...['input', 'output'].map(kind =>
    h('section', { key: kind },
      h('strong', null, kind === 'input' ? 'Data input associations' : 'Data output associations'),
      ...dataAssociations(element, kind).map(association => {
        const local = element.businessObject.ioSpecification?.get(kind === 'input' ? 'dataInputs' : 'dataOutputs') || []
        const candidates = kind === 'output' ? local : associationCandidates(element, kind, registry).filter(item => !local.includes(item))
        const selected = association.sourceRef || []
        const sources = [...new Set([...candidates, ...selected].filter(Boolean))]
        return h('div', { key: association.id },
          h('span', null, association.id),
          h('strong', null, 'Sources (multiple allowed)'),
          ...sources.map(reference => h(SourceMembershipEntry, { key: reference.id, element, kind, association, reference, id: `bpmns-assoc-${association.id}-source-${reference.id}` })),
          h(ReferenceEntry, { element, kind, association, role: 'target', id: `bpmns-assoc-${association.id}-target` }),
          h('strong', null, 'Assignments'),
          ...(association.assignment || []).map((assignment, index) => h('div', { key: index },
            h(ExpressionEntry, { element, kind, association, assignment, side: 'from', id: `bpmns-assoc-${association.id}-assignment-${index}-from` }),
            h(ExpressionEntry, { element, kind, association, assignment, side: 'to', id: `bpmns-assoc-${association.id}-assignment-${index}-to` }),
            h('button', { type: 'button', onClick: () => removeAssociationAssignment(element, kind, association, assignment, modeling) }, 'Remove assignment')
          )),
          h('button', { type: 'button', onClick: () => addAssociationAssignment(element, kind, association, modeling, factory) }, 'Add assignment'),
          h('button', { type: 'button', onClick: () => removeDataAssociation(element, kind, association, modeling) }, 'Remove association')
        )
      }),
      h('button', { type: 'button', disabled: !(element.businessObject.ioSpecification?.get(kind === 'input' ? 'dataInputs' : 'dataOutputs') || []).length,
        onClick: () => addDataAssociation(element, kind, modeling, factory, registry) }, `Add ${kind} association`)
    )
  ))
}
export function appendDataAssociationsGroup(groups, element) {
  if (!element?.businessObject?.ioSpecification || groups.some(group => group.id === 'bpmns-data-associations')) return groups
  return [...groups, { id: 'bpmns-data-associations', label: 'BPMN data associations', entries: [
    { id: 'bpmns-data-associations-entry', element, component: AssociationsEntry, isEdited: isSelectEntryEdited }
  ] }]
}
