import { afterEach, describe, expect, it, vi } from 'vitest'
import { createToolbar } from './toolbar.js'

const originalWindow = globalThis.window
afterEach(() => { if (originalWindow === undefined) delete globalThis.window; else globalThis.window = originalWindow })

describe('Folder command dispatch does not capture a block-scoped capability', () => {
  it('dispatches Open Folder when the API is present', () => {
    globalThis.window = { showDirectoryPicker() {}, sessionStorage: { getItem: () => null } }
    const open = vi.fn()
    const toolbar = createToolbar({ mode: 'editor', onOpenWorkspaceFolder: open })
    expect(() => toolbar.onClick({ target: 'workspace:open-workspace-folder' })).not.toThrow()
    expect(open).toHaveBeenCalledOnce()
  })
  it('does not dispatch Folder commands after a policy refusal', () => {
    globalThis.window = { showDirectoryPicker() {}, sessionStorage: { getItem: () => '1' } }
    const open = vi.fn(), save = vi.fn(), saveAs = vi.fn()
    const toolbar = createToolbar({ mode: 'editor', onOpenWorkspaceFolder: open, onSaveWorkspaceFolder: save, onSaveWorkspaceAsFolder: saveAs })
    for (const id of ['open-workspace-folder','save-workspace-folder','save-workspace-as-folder'])
      expect(() => toolbar.onClick({ target: 'workspace:' + id })).not.toThrow()
    expect(open).not.toHaveBeenCalled()
    expect(save).not.toHaveBeenCalled()
    expect(saveAs).not.toHaveBeenCalled()
  })
})
