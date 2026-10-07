import { createBusinessObject } from './business-object.js'

export function accumulateBusinessObject({ businessObjectStore, businessObject } = {}) {
  if (!businessObjectStore) throw new Error('accumulateBusinessObject requires businessObjectStore')
  const incoming = createBusinessObject(businessObject)
  const existing = businessObjectStore.getBusinessObject(incoming.id)
  if (!existing) {
    return { state: 'resolved', action: 'added', businessObject: businessObjectStore.addBusinessObject(incoming), conflicts: [] }
  }

  const conflicts = []
  if (existing.name && incoming.name && existing.name !== incoming.name) {
    conflicts.push({ property: 'name', existing: existing.name, incoming: incoming.name })
  }
  if (conflicts.length) {
    return { state: 'conflict', action: 'preserved', businessObject: existing, incoming, conflicts }
  }

  const merged = createBusinessObject({
    id: existing.id,
    name: existing.name || incoming.name,
    typeRefs: [ ...new Set([ ...existing.typeRefs, ...incoming.typeRefs ]) ]
  })
  const changed = JSON.stringify(existing) !== JSON.stringify(merged)
  if (changed) {
    businessObjectStore.removeBusinessObject(existing.id)
    businessObjectStore.addBusinessObject(merged)
  }
  return { state: 'resolved', action: changed ? 'enriched' : 'unchanged', businessObject: changed ? merged : existing, conflicts: [] }
}

export function resolveBusinessObjectReference({ businessObjectStore, businessObjectId } = {}) {
  const businessObject = businessObjectStore?.getBusinessObject?.(businessObjectId) || null
  return Object.freeze({
    businessObjectId,
    state: businessObject ? 'resolved' : 'unresolved',
    businessObject
  })
}
