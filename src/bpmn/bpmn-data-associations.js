/** PROP-007E: data association references are moddle objects, never free-text IDs. */
import { uniqueBpmnId } from './bpmn-io-structure.js'

const config = kind => {
  if (kind === 'input') return { property: 'dataInputAssociations', type: 'bpmn:DataInputAssociation', target: 'dataInputs' }
  if (kind === 'output') return { property: 'dataOutputAssociations', type: 'bpmn:DataOutputAssociation', source: 'dataOutputs' }
  throw new Error('Invalid association kind')
}
export function dataAssociations(element, kind) {
  return element.businessObject.get(config(kind).property) || []
}
export function associationCandidates(element, kind, registry) {
  const io = element.businessObject.ioSpecification
  const local = io?.get(kind === 'input' ? 'dataInputs' : 'dataOutputs') || []
  const external = (registry?.getAll?.() || [])
    .map(entry => entry.businessObject)
    .filter(Boolean)
    .filter(bo => ['bpmn:DataObjectReference', 'bpmn:DataStoreReference', 'bpmn:Property'].includes(bo.$type))
  const unique = new Map()
  for (const bo of [...local, ...external]) if (bo.id) unique.set(bo.id, bo)
  return [...unique.values()]
}
export function addDataAssociation(element, kind, modeling, factory, registry) {
  const cfg = config(kind)
  const io = element.businessObject.ioSpecification
  const local = io?.get(kind === 'input' ? 'dataInputs' : 'dataOutputs') || []
  if (!local.length) throw new Error('Create a data input/output first')
  const association = factory.create(cfg.type, {
    id: uniqueBpmnId(kind === 'input' ? 'DataInputAssociation' : 'DataOutputAssociation', registry),
    ...(kind === 'input' ? { targetRef: local[0], sourceRef: [] } : { sourceRef: [local[0]] })
  })
  modeling.updateProperties(element, { [cfg.property]: [...dataAssociations(element, kind), association] })
  return association
}
export function removeDataAssociation(element, kind, association, modeling) {
  const cfg = config(kind)
  const previous = dataAssociations(element, kind)
  if (!previous.includes(association)) return false
  modeling.updateProperties(element, { [cfg.property]: previous.filter(item => item !== association) })
  return true
}
export function setDataAssociationRef(element, kind, association, role, reference, modeling, registry) {
  const cfg = config(kind)
  if (!dataAssociations(element, kind).includes(association)) throw new Error('Association does not belong to element')
  if (!['source', 'target'].includes(role)) throw new Error('Invalid association reference role')
  const local = element.businessObject.ioSpecification?.get(kind === 'input' ? 'dataInputs' : 'dataOutputs') || []
  const allowed = role === (kind === 'input' ? 'target' : 'source')
    ? local : associationCandidates(element, kind, registry).filter(item => !local.includes(item))
  if (reference && !allowed.includes(reference)) throw new Error('Reference is not a permitted BPMN object')
  if (role === 'source') {
    if ((association.sourceRef || []).length > 1) throw new Error('Use source membership editing for multi-source associations')
    modeling.updateModdleProperties(element, association, { sourceRef: reference ? [reference] : [] })
  } else {
    if (!reference && kind === 'input') throw new Error('Input association requires a data input target')
    modeling.updateModdleProperties(element, association, { targetRef: reference || undefined })
  }
}

/** Add/remove an individual source without replacing other references. */
export function setAssociationSourceMembership(element, kind, association, reference, enabled, modeling, registry) {
  if (!dataAssociations(element, kind).includes(association)) throw new Error('Association does not belong to element')
  const local = element.businessObject.ioSpecification?.get(kind === 'input' ? 'dataInputs' : 'dataOutputs') || []
  const allowed = kind === 'output' ? local : associationCandidates(element, kind, registry).filter(item => !local.includes(item))
  const previous = association.sourceRef || []
  // A source that disappeared from the registry must remain removable.
  // Adding new references still requires an eligible BPMN object.
  if (enabled && !allowed.includes(reference)) throw new Error('Reference is not a permitted BPMN object')
  if (!enabled && !previous.includes(reference)) return false
  const next = enabled
    ? (previous.includes(reference) ? previous : [...previous, reference])
    : previous.filter(item => item !== reference)
  if (next.length === previous.length && next.every((item, index) => item === previous[index])) return false
  modeling.updateModdleProperties(element, association, { sourceRef: next })
  return true
}

export function addAssociationAssignment(element, kind, association, modeling, factory) {
  if (!dataAssociations(element, kind).includes(association)) throw new Error('Association does not belong to element')
  const assignment = factory.create('bpmn:Assignment', {
    from: factory.create('bpmn:FormalExpression', { body: '' }),
    to: factory.create('bpmn:FormalExpression', { body: '' })
  })
  modeling.updateModdleProperties(element, association, { assignment: [...(association.assignment || []), assignment] })
  return assignment
}

export function removeAssociationAssignment(element, kind, association, assignment, modeling) {
  if (!dataAssociations(element, kind).includes(association)) throw new Error('Association does not belong to element')
  if (!(association.assignment || []).includes(assignment)) return false
  modeling.updateModdleProperties(element, association, { assignment: association.assignment.filter(item => item !== assignment) })
  return true
}

export function setAssignmentExpression(element, kind, association, assignment, side, body, modeling, factory) {
  if (!['from', 'to'].includes(side)) throw new Error('Invalid assignment side')
  if (!dataAssociations(element, kind).includes(association) || !(association.assignment || []).includes(assignment)) throw new Error('Assignment does not belong to association')
  const expression = assignment[side]
  if (expression) modeling.updateModdleProperties(element, expression, { body })
  else modeling.updateModdleProperties(element, assignment, { [side]: factory.create('bpmn:FormalExpression', { body }) })
}
