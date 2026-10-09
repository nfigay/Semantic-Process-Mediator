/**
 * Resolve the declaring class from the live bpmn-moddle type descriptor.
 * This is a bulk operation: no property-by-property inheritance table.
 */
export function inheritedPropertyLabel(moddle, typeName, propertyName) {
  if (!moddle || !typeName || !propertyName) return null
  try {
    const descriptor = moddle.getType(typeName)?.$descriptor
    const property = descriptor?.propertiesByName?.[propertyName]
    const owner = property?.definedBy?.name
    const selected = typeName.split(':').pop()
    if (!owner || owner.split(':').pop() === selected) return null
    return `(${owner} · inherited)`
  } catch {
    return null
  }
}

export function effectivePropertyOrigins(moddle, typeName) {
  if (!moddle || !typeName) return []
  try {
    const descriptor = moddle.getType(typeName)?.$descriptor
    const properties = descriptor?.properties || []
    return properties.map(property => ({
      name: property.name,
      declaredBy: property.definedBy?.name || null,
      inherited: Boolean(property.definedBy?.name && property.definedBy.name.split(':').pop() !== typeName.split(':').pop()),
      type: property.type,
      isMany: Boolean(property.isMany),
      isReference: Boolean(property.isReference)
    }))
  } catch {
    return []
  }
}
