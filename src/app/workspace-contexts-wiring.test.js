import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const source = readFileSync(
  new URL('./create-app.js', import.meta.url),
  'utf8'
)

describe('workspace contexts runtime wiring', () => {
  it('mounts the autonomous contexts browser and search from the real app authority', () => {
    expect(source).toContain("createWorkspaceContextsBrowser")
    expect(source).toContain('layout.contextsBrowserContainer')
    expect(source).toContain('layout.contextsTreeSearchContainer')
    expect(source).toMatch(/createWorkspaceContextsBrowser\(\{[\s\S]*?businessObjectStore:\s*activeBusinessObjectStore/)
  })

  it('keeps the legacy repository browser dedicated to sources', () => {
    expect(source).toContain("repositoryBrowser.setView('sources')")
    expect(source).not.toContain('repositoryBrowser.setView(navigation)')
  })
})
