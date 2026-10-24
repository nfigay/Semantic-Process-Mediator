import { describe, it, expect } from 'vitest'
import { workspaceSnapshotState, hasWorkspaceSnapshotChange, acceptWorkspaceSnapshot } from './workspace-snapshot-change.js'

const fixture = () => ({ workspaceId: 'w', name: 'WS', description: 'desc', savedAt: '2020', snapshotIteration: 1 })
const docs = () => [{ fileName: 'a.bpmn', content: '<definitions />', dirty: false }]

describe('WS-01 logical snapshot change', () => {
  it('does not save when only timestamps, iteration, or dirty flags change', () => {
    const w = fixture(); const d = docs()
    acceptWorkspaceSnapshot(w, d)
    w.savedAt = '2026'; w.snapshotIteration = 2; d[0].dirty = true
    expect(hasWorkspaceSnapshotChange(w, d)).toBe(false)
  })
  it('detects BPMN content, metadata, and document inventory changes', () => {
    const w = fixture(); const d = docs(); acceptWorkspaceSnapshot(w, d)
    d[0].content = '<definitions id="changed" />'
    expect(hasWorkspaceSnapshotChange(w, d)).toBe(true)
    acceptWorkspaceSnapshot(w, d); w.description = 'changed'
    expect(hasWorkspaceSnapshotChange(w, d)).toBe(true)
    acceptWorkspaceSnapshot(w, d); d.push({ fileName: 'b.bpmn', content: 'x' })
    expect(hasWorkspaceSnapshotChange(w, d)).toBe(true)
  })
  it('does not depend on document order', () => {
    const w = fixture(); const d = [{ fileName: 'b', content: '2' }, { fileName: 'a', content: '1' }]
    acceptWorkspaceSnapshot(w, d)
    d.reverse()
    expect(workspaceSnapshotState(w, d)).toBe(w.snapshotBaseline)
  })
  it('treats unknown baseline as needing persistence', () => {
    expect(hasWorkspaceSnapshotChange(fixture(), docs())).toBe(true)
  })
})
