/** Conservative native editor mapping. Unrecognised entries are never modified. */
export const NATIVE_PROPERTY_IDS = Object.freeze({
  id: 'id', name: 'name', documentation: 'documentation',
  isExecutable: 'isExecutable', asyncBefore: 'asyncBefore', asyncAfter: 'asyncAfter',
  'general-id': 'id', 'general-name': 'name',
  'general-isExecutable': 'isExecutable'
})

export function nativeEntryProperty(entry) {
  if (!entry || typeof entry !== 'object') return null
  if (typeof entry.semanticProperty === 'string' && entry.semanticProperty) return entry.semanticProperty
  return Object.prototype.hasOwnProperty.call(NATIVE_PROPERTY_IDS, entry.id)
    ? NATIVE_PROPERTY_IDS[entry.id] : null
}

export function decorateNativeEntries(groups, moddle, type, inheritedPropertyLabel, wrap) {
  return groups.map(group => {
    if (!Array.isArray(group.entries)) return group
    let changed = false
    const entries = group.entries.map(entry => {
      const property = nativeEntryProperty(entry)
      const origin = property && inheritedPropertyLabel(moddle, type, property)
      if (!origin || typeof entry.component !== 'function') return entry
      changed = true
      return { ...entry, component: wrap(entry.component, origin), inheritedLabel: origin,
        semanticProperty: property }
    })
    return changed ? { ...group, entries } : group
  })
}
