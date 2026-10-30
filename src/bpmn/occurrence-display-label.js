/** Presentation-only label; never persist the derived value in BPMN name. */
export function getOccurrenceDisplayLabel(bo) {
  const explicit = typeof bo?.name === 'string' ? bo.name.trim() : ''
  if (!['bpmn:DataObjectReference', 'bpmn:DataStoreReference'].includes(bo?.$type)) {
    return bo?.name || ''
  }
  // A reference name is a complete override, not a prefix for [state].
  if (explicit) return explicit
  const master = bo.$type === 'bpmn:DataObjectReference' ? bo.dataObjectRef : bo.dataStoreRef
  const name = typeof master?.name === 'string' ? master.name.trim() : ''
  const state = typeof bo.dataState?.name === 'string' ? bo.dataState.name.trim() : ''
  return state ? (name ? `${name} [${state}]` : `[${state}]`) : name
}
