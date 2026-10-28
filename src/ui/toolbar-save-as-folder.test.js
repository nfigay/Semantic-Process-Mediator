import { afterEach, describe, expect, it, vi } from 'vitest'
import { createToolbar } from './toolbar.js'
const originalWindow = globalThis.window
afterEach(() => {
  if (originalWindow === undefined) delete globalThis.window
  else globalThis.window = originalWindow
})
describe('Save Workspace As Folder toolbar dispatch', () => {
  it('shows disabled command when directory picker is not available', () => {
    globalThis.window = { sessionStorage: { getItem: () => null } }
    const toolbar = createToolbar({ mode: 'editor' })
    const item = toolbar.items.find(item => item.id === 'workspace').items.find(item => item.id === 'save-workspace-as-folder')
    expect(item).toBeUndefined()
  })
  it('hides all Folder commands after an earlier denial, keeping Archive commands', () => {
    globalThis.window = { showDirectoryPicker() {}, sessionStorage: { getItem: key => key === 'bpmnsm.directWorkspaceDenied' ? '1' : null } }
    const toolbar = createToolbar({ mode: 'editor' })
    const ids = toolbar.items.find(item => item.id === 'workspace').items.map(item => item.id)
    expect(ids).not.toContain('open-workspace-folder')
    expect(ids).not.toContain('save-workspace-folder')
    expect(ids).not.toContain('save-workspace-as-folder')
    expect(ids).toContain('save-workspace-archive')
    expect(ids).toContain('save-workspace-as-archive')
  })
  it('routes enabled command to application callback', () => {
    globalThis.window = { showDirectoryPicker() {}, sessionStorage: { getItem: () => null } }
    const callback = vi.fn()
    const toolbar = createToolbar({ mode: 'editor', onSaveWorkspaceAsFolder: callback })
    const item = toolbar.items.find(item => item.id === 'workspace').items.find(item => item.id === 'save-workspace-as-folder')
    // Workspace entries start disabled; runtime state enables them only after activation.
    expect(item.disabled).toBe(true)
    toolbar.onClick({ target: 'workspace:save-workspace-as-folder' })
    expect(callback).toHaveBeenCalledOnce()
  })
})
