import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
const main = readFileSync(new URL('./main.js', import.meta.url), 'utf8')
const layout = readFileSync(new URL('./ui/layout.js', import.meta.url), 'utf8')
const toolbar = readFileSync(new URL('./ui/toolbar.js', import.meta.url), 'utf8')
describe('WS01 workspace document lifecycle contracts', () => {
  it('creates and activates a real repository document after loading a new BPMN', () => {
    const section = main.split('onNewBpmnModel() {')[1].split('async onOpenWorkspaceFolder()')[0]
    expect(section).toContain('repository.documents.addDocument({')
    expect(section).toContain('repository.documents.setActiveDocument(document.id)')
    expect(section).toContain('await diagramActions.loadDiagram(xml)')
    expect(section).toContain('repository.documents.setActiveDocument(null)')
    expect(section).toContain('repository.documents.setActiveDocument(previous?.id || null)')
  })
  it('guards new BPMN before an explicit Workspace', () => {
    expect(main).toContain('requestWorkspaceCreation(openDialog)')
    expect(main).toContain("if (!resolveActiveRepository()?.workspace?.workspaceId)")
  })
  it('starts Save menu entries disabled and exposes W2UI state updates', () => {
    for (const id of ['save-workspace-folder','save-workspace-as-folder','save-workspace-archive','save-workspace-as-archive']) {
      expect(toolbar).toMatch(new RegExp("id: '" + id + "'[^\n]+disabled: true"))
      expect(layout).toContain("'" + id + "':")
    }
    expect(layout).toContain("instance.refresh?.('workspace')")
  })
})
