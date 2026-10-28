import { describe, expect, it } from 'vitest'
import { createToolbar } from './toolbar.js'

const entries = () => createToolbar({ mode: 'editor' }).items.find(item => item.id === 'workspace').items

describe('Workspace menu simplification', () => {
  it('keeps Save / Save As together without exposing technical Export', () => {
    const items = entries()
    const ids = items.map(item => item.id ?? (item.type === 'break' ? 'break' : '?'))
    expect(ids).not.toContain('export-workspace-archive')
    const saveArchive = ids.indexOf('save-workspace-archive')
    expect(saveArchive).toBeGreaterThanOrEqual(0)
    expect(ids.slice(saveArchive, saveArchive + (ids.includes('save-workspace-as-folder') ? 3 : 2))).toEqual(
      ids.includes('save-workspace-as-folder')
        ? ['save-workspace-archive', 'save-workspace-as-folder', 'save-workspace-as-archive']
        : ['save-workspace-archive', 'save-workspace-as-archive']
    )
    const folder = ids.indexOf('save-workspace-folder')
    if (folder !== -1) expect(folder).toBeLessThan(saveArchive)
    // Initially disabled until a Workspace is active, regardless of picker support.
    expect(items.find(item => item.id === 'save-workspace-archive')?.disabled).toBe(true)
  })
  it('preserves human-readable Save / Save As labels', () => {
    const items = entries()
    for (const [id, label] of [
      ['save-workspace-archive', 'Save Workspace Archive'],
      ['save-workspace-as-archive', 'Save Workspace As Archive…']
    ]) expect(items.find(item => item.id === id)?.text).toBe(label)
  })
})
