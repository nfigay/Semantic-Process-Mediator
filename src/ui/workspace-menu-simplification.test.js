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
    expect(ids.slice(saveArchive, saveArchive + 3)).toEqual([
      'save-workspace-archive', 'save-workspace-as-folder', 'save-workspace-as-archive'
    ])
    const folder = ids.indexOf('save-workspace-folder')
    if (folder !== -1) expect(folder).toBeLessThan(saveArchive)
    expect(items.find(item => item.id === 'save-workspace-archive')?.disabled).toBe(typeof window === 'undefined' || typeof window.showSaveFilePicker !== 'function')
  })
  it('preserves human-readable Save / Save As labels', () => {
    const items = entries()
    for (const [id, label] of [
      ['save-workspace-archive', 'Save Workspace Archive'],
      ['save-workspace-as-folder', 'Save Workspace As Folder…'],
      ['save-workspace-as-archive', 'Save Workspace As Archive…']
    ]) expect(items.find(item => item.id === id)?.text).toBe(label)
  })
})
