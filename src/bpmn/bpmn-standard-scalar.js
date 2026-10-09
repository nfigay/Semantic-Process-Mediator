/** Bulk scalar classification based on the effective moddle descriptor. */
const PRIMITIVES = new Set([ 'String', 'Integer', 'Real', 'Boolean' ])
const RESERVED = new Set([ 'id', 'name', 'documentation', 'extensionElements', 'extensionDefinitions' ])
const NON_EDITABLE = new Set([ 'incoming', 'outgoing', 'sourceRef', 'targetRef', 'laneSet', 'flowElements', 'flowNodeRef', 'categoryValueRef' ])

export function classifyScalar(property, moddle) {
  if (!property || property.isMany || property.isReference || property.isVirtual || property.isDerived || property.isReadOnly) return null
  if (RESERVED.has(property.name) || NON_EDITABLE.has(property.name)) return null
  if (PRIMITIVES.has(property.type)) return property.type
  try {
    const descriptor = moddle.getType(property.type)?.$descriptor
    if (descriptor?.isEnum || descriptor?.literals) return 'Enum'
  } catch { /* not an enum descriptor */ }
  return null
}

export function collectScalarProperties(moddle, type) {
  try {
    const descriptor = moddle.getType(type)?.$descriptor
    return (descriptor?.properties || [])
      .map(property => ({ property, kind: classifyScalar(property, moddle) }))
      .filter(({ kind }) => Boolean(kind))
  } catch { return [] }
}

export function isRepresentedByNativeEntry(groups, propertyName) {
  const name = propertyName.toLowerCase()
  return groups.some(group => (group.entries || []).some(entry => {
    const id = String(entry.id || '').toLowerCase()
    const semantic = String(entry.semanticProperty || '').toLowerCase()
    return semantic === name || id === name || id.endsWith('-' + name) || id.endsWith('_' + name)
  }))
}

export function scalarValueToModdle(kind, value) {
  if (kind === 'Boolean') return Boolean(value)
  if (value === '' || value === undefined || value === null) return undefined
  if (kind === 'Integer' || kind === 'Real') {
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || (kind === 'Integer' && !Number.isInteger(parsed))) return null
    return parsed
  }
  return String(value)
}
