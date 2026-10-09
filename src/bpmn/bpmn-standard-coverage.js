/** Pure metadata helpers. Never infer a native editor from an arbitrary ID suffix. */
export function nativePropertyIndex(groups) {
  const names = new Set()
  for (const group of groups || []) for (const entry of group.entries || []) {
    if (typeof entry.semanticProperty === 'string' && entry.semanticProperty) names.add(entry.semanticProperty)
    // Official bpmn-js entries with unambiguous IDs only.
    const id = String(entry.id || '')
    const exact = /^(?:[A-Za-z0-9_-]+-)?(id|name|documentation|isExecutable|asyncBefore|asyncAfter)$/.exec(id)
    if (exact) names.add(exact[1])
  }
  return names
}

export function enumOptions(moddle, type) {
  try {
    const d = moddle.getType(type)?.$descriptor
    return (d?.literals || []).map(x => typeof x === 'string' ? x : x?.name).filter(Boolean)
  } catch { return [] }
}

export function propertyCoverage(moddle, type, groups, collect) {
  const native = nativePropertyIndex(groups)
  return collect(moddle, type).map(({ property, kind }) => {
    const options = kind === 'Enum' ? enumOptions(moddle, property.type) : []
    const status = native.has(property.name) ? 'NATIVE' : kind === 'Enum' && !options.length ? 'UNSUPPORTED_ENUM' : 'GENERATED'
    return { property, kind, options, status }
  })
}
