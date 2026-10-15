import { equivalentWorkspaceBpmnXml } from './workspace-xml-equivalence.js'

/**
 * Conservative safeguard before replacing an active Workspace.
 * A rejection never mutates the repository or BPMN.io modeler.
 */
export async function assessWorkspaceTransition({ repository, modeler, emptyCanvasBaselineXml } = {}) {
  const documents = repository?.documents?.getDocuments?.()
  if (!Array.isArray(documents)) return { safe: false, reason: 'DOCUMENT_STATE_UNKNOWN' }
  if (documents.some(document => document?.dirty !== false)) {
    return { safe: false, reason: 'DOCUMENT_STATE_DIRTY_OR_UNKNOWN' }
  }
  if (!modeler || typeof modeler.get !== 'function') {
    return { safe: false, reason: 'MODELER_UNAVAILABLE' }
  }
  let commandStack
  try { commandStack = modeler.get('commandStack') } catch {
    return { safe: false, reason: 'COMMAND_STACK_UNAVAILABLE' }
  }
  if (!commandStack || typeof commandStack.canUndo !== 'function') {
    return { safe: false, reason: 'COMMAND_STACK_UNAVAILABLE' }
  }
  try {
    if (commandStack.canUndo()) return { safe: false, reason: 'CANVAS_COMMAND_HISTORY' }
  } catch { return { safe: false, reason: 'COMMAND_STACK_UNKNOWN' } }

  const active = repository?.documents?.getActiveDocument?.()
  // Empty repository: only an explicitly captured, serialized empty-view baseline
  // is acceptable. A missing or stale baseline fails closed.
  const isEmpty = !active && documents.length === 0
  if (!isEmpty && (!active || active.kind !== 'bpmn' || typeof active.content !== 'string')) {
    return { safe: false, reason: 'ACTIVE_DOCUMENT_OR_EMPTY_CANVAS_UNVERIFIED' }
  }
  if (isEmpty && (typeof emptyCanvasBaselineXml !== 'string' || !emptyCanvasBaselineXml)) {
    return { safe: false, reason: 'EMPTY_CANVAS_BASELINE_UNAVAILABLE' }
  }
  if (typeof modeler.saveXML !== 'function') {
    return { safe: false, reason: 'CANVAS_SERIALIZATION_UNAVAILABLE' }
  }
  try {
    const result = await modeler.saveXML({ format: true })
    if (typeof result?.xml !== 'string') return { safe: false, reason: 'CANVAS_SERIALIZATION_INVALID' }
    if (isEmpty && result.xml !== emptyCanvasBaselineXml) {
      return { safe: false, reason: 'EMPTY_CANVAS_CHANGED' }
    }
    if (!isEmpty && !equivalentWorkspaceBpmnXml(result.xml, active.content)) {
      return { safe: false, reason: 'CANVAS_DOCUMENT_MISMATCH' }
    }
  } catch {
    return { safe: false, reason: 'CANVAS_SERIALIZATION_FAILED' }
  }
  return { safe: true, reason: isEmpty ? 'KNOWN_EMPTY_CANVAS' : 'DOCUMENT_AND_CANVAS_MATCH' }
}
