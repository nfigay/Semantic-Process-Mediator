import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import { createToolbar } from './toolbar.js'
const main = fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8')
const layout = fs.readFileSync(new URL('./layout.js', import.meta.url), 'utf8')
describe('Workspace offline help and denial UX contract', () => {
  it('places offline Workspace guidance on the welcome page, not in the menu', () => {
    const toolbar = createToolbar({ mode: 'editor' })
    const menu = toolbar.items.find(x => x.id === 'workspace')
    expect(menu.items.some(x => x.id === 'workspace-help')).toBe(false)
    const welcome = fs.readFileSync(
      new URL('./views/workspace-welcome-view.js', import.meta.url), 'utf8'
    )
    expect(welcome).toContain('How to start with BPMN Semantic Mediator Workspaces')
    expect(welcome).toContain('Working in a restricted browser')
  })
  it('does not reload after a folder policy denial', () => {
    const body = main.slice(main.indexOf('async onOpenWorkspaceFolder()'), main.indexOf('onOpenWorkspaceArchive()', main.indexOf('async onOpenWorkspaceFolder()')))
    expect(body).toContain('layout.hideWorkspaceFolderCommands?.()')
    expect(body).toContain('showWorkspaceHelp({ restricted: true })')
    expect(body).not.toContain('location.reload(')
  })
  it('removes all three folder commands from W2UI menu', () => {
    for (const name of ['open-workspace-folder', 'save-workspace-folder', 'save-workspace-as-folder']) expect(layout).toContain(name)
    expect(layout).toContain('menu.items.filter(item => !ids.has(item.id))')
  })
})
