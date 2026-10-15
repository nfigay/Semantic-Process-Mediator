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
    expect(item.disabled).toBe(true)
  })
  it('routes enabled command to application callback', () => {
    globalThis.window = { showDirectoryPicker() {}, sessionStorage: { getItem: () => null } }
    const callback = vi.fn()
    const toolbar = createToolbar({ mode: 'editor', onSaveWorkspaceAsFolder: callback })
    const item = toolbar.items.find(item => item.id === 'workspace').items.find(item => item.id === 'save-workspace-as-folder')
    expect(item.disabled).toBe(false)
    toolbar.onClick({ target: 'workspace:save-workspace-as-folder' })
    expect(callback).toHaveBeenCalledOnce()
  })
})
