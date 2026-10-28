import { describe, expect, it, vi } from 'vitest'
import fs from 'node:fs'
import { createWorkspaceWelcomeView } from './views/workspace-welcome-view.js'

describe('Workspace welcome alternative and save feedback', () => {
  it('keeps the legacy view and switches the editor to the separate Workspace view', () => {
    const legacy = fs.readFileSync(new URL('./views/welcome-view.js', import.meta.url), 'utf8')
    expect(legacy).toContain('createWelcomeView')
    const layout = fs.readFileSync(new URL('./layout.js', import.meta.url), 'utf8')
    expect(layout).toContain("EDITOR_WELCOME_VARIANT = 'workspace'")
    expect(layout).toContain("isViewer || EDITOR_WELCOME_VARIANT === 'legacy'")
    expect(layout).toContain('createWorkspaceWelcomeView')
  })
  it('contains embedded offline instructions and attaches existing actions', () => {
    const callbacks = Object.fromEntries(['new-workspace','open-workspace-archive','new-process','import-bpmn'].map(a => [a, vi.fn()]))
    const view = createWorkspaceWelcomeView({ onNewWorkspace: callbacks['new-workspace'], onOpenWorkspaceArchive: callbacks['open-workspace-archive'], onNewProcess: callbacks['new-process'], onImportBpmn: callbacks['import-bpmn'] })
    expect(view.html).toContain('How to start with BPMN Semantic Mediator Workspaces')
    expect(view.html).toContain('restricted browser')
    const handlers = new Map()
    const container = { querySelector: selector => ({ addEventListener: (_event, cb) => handlers.set(selector, cb) }) }
    view.onActivate({ container })
    for (const [action, callback] of Object.entries(callbacks)) {
      const handler = handlers.get(`[data-welcome-action="${action}"]`)
      expect(handler).toBe(callback)
      handler()
      expect(callback).toHaveBeenCalledOnce()
    }
  })
  it('keeps Save As separate and reports an unchanged Save', () => {
    const main = fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8')
    expect(main).toContain('No unsaved changes in this Workspace')
    expect(main).toContain('hasWorkspaceSnapshotChange(workspace, documents)')
    const toolbar = fs.readFileSync(new URL('./toolbar.js', import.meta.url), 'utf8')
    expect(toolbar).not.toContain("workspaceItems.push({ id: 'workspace-help'")
    expect(toolbar).toContain('save-workspace-as-archive')
  })
})
