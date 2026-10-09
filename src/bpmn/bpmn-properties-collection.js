/** BPMN Property collection: structural edits through the modeling command stack. */
import { uniqueBpmnId } from './bpmn-io-structure.js'

export function supportsBpmnProperties(moddle, type) {
  return Boolean(type && moddle?.getType(type)?.$descriptor?.propertiesByName?.properties?.isMany)
}

export function bpmnProperties(element) {
  return element?.businessObject?.get('properties') || []
}

export function addBpmnProperty(element, modeling, factory, registry) {
  const property = factory.create('bpmn:Property', {
    id: uniqueBpmnId('Property', registry), name: 'Property'
  })
  modeling.updateProperties(element, { properties: [...bpmnProperties(element), property] })
  return property
}

export function renameBpmnProperty(element, property, name, modeling) {
  if (!bpmnProperties(element).includes(property)) throw new Error('Property does not belong to selected element')
  modeling.updateModdleProperties(element, property, { name })
}

export function isBpmnPropertyReferenced(element, property) {
  const bo = element.businessObject
  for (const key of ['dataInputAssociations', 'dataOutputAssociations']) {
    for (const association of bo.get(key) || []) {
      if ((association.sourceRef || []).includes(property) || association.targetRef === property) return true
    }
  }
  return false
}

export function removeBpmnProperty(element, property, modeling) {
  const existing = bpmnProperties(element)
  if (!existing.includes(property)) return false
  if (isBpmnPropertyReferenced(element, property)) throw new Error('Property is referenced by a data association')
  modeling.updateProperties(element, { properties: existing.filter(candidate => candidate !== property) })
  return true
}
