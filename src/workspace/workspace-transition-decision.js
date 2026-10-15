/**
 * WS-01: a shared, non-mutating decision gate for New/Open/Close.
 * The caller must finish candidate preparation before calling this gate.
 * Decisions and save receipts are explicit; starting a download is not a save receipt.
 */
export async function authorizeWorkspaceReplacement({ assess, choose, saveAndVerify } = {}) {
  if (typeof assess !== 'function' || typeof choose !== 'function') {
    throw new TypeError('Workspace transition requires assess and choose callbacks')
  }
  let state
  try {
    state = await assess()
  } catch (error) {
    return { authorized: false, reason: 'ASSESSMENT_FAILED', error }
  }
  if (state?.safe === true) {
    return { authorized: true, reason: 'VERIFIED_CLEAN' }
  }
  // Unknown is treated as potentially dirty; only an explicit user decision can proceed.
  let choice
  try {
    choice = await choose({ reason: state?.reason || 'WORKSPACE_STATE_UNKNOWN' })
  } catch (error) {
    return { authorized: false, reason: 'DECISION_FAILED', error }
  }
  if (choice === 'cancel') return { authorized: false, reason: 'CANCELLED' }
  if (choice === 'discard') return { authorized: true, reason: 'EXPLICIT_DISCARD' }
  if (choice !== 'save') return { authorized: false, reason: 'INVALID_DECISION' }
  if (typeof saveAndVerify !== 'function') return { authorized: false, reason: 'VERIFIED_SAVE_UNAVAILABLE' }
  try {
    const receipt = await saveAndVerify()
    if (receipt?.verified !== true || !receipt?.destination || !receipt?.snapshotId) {
      return { authorized: false, reason: 'SAVE_NOT_VERIFIED' }
    }
    return { authorized: true, reason: 'VERIFIED_SAVE', receipt }
  } catch (error) {
    return { authorized: false, reason: 'SAVE_FAILED', error }
  }
}
