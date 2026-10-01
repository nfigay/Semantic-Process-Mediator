import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'

const root = process.cwd()
const source = fs.readFileSync(
  path.join(root, 'src/publication/hosted-process-viewer-workspace.js'),
  'utf8'
)

describe('hosted process viewer workspace contract', () => {
  test('uses native W2UI layout for the resizable Properties pane', () => {
    expect(source).toContain('w2layout')
    expect(source).toMatch(/type:\s*'right'[\s\S]*resizable:\s*true/)
    expect(source).toContain("title: 'Properties'")
    expect(source).toContain("contentLayout.el('main').innerHTML")
    expect(source).toContain("layout.el('right').innerHTML")
    expect(source).toContain('id=\"publication-viewer\"')
    expect(source).toContain('id=\"publication-properties\"')
    expect(source).toContain("contentLayout.assignToolbar('main', toolbar)")

    const toolbarIndex = source.indexOf("contentLayout.assignToolbar('main', toolbar)")
    const viewerHostIndex = source.indexOf("contentLayout.el('main').innerHTML")
    const propertiesHostIndex = source.indexOf("layout.el('right').innerHTML")

    expect(toolbarIndex).toBeGreaterThan(-1)
    expect(toolbarIndex).toBeLessThan(viewerHostIndex)
    // Properties belongs to the outer layout; the toolbar belongs to the
    // nested consultation layout. Source-text ordering is not a layout contract.
    expect(propertiesHostIndex).toBeGreaterThan(-1)
  })

  test('supports compact embed presentation without forking the workspace', () => {
    expect(source).toContain('embedded = false')
    expect(source).toContain('size: embedded ? 320 : 360')
    expect(source).toContain("...(embedded ? {} : { title: 'Properties' })")
  })

  test('uses a W2UI toolbar for direct fit and zoom consultation commands', () => {
    expect(source).toContain('w2toolbar')
    expect(source).toContain("id: 'fit'")
    expect(source).toContain("id: 'zoom-out'")
    expect(source).toContain("id: 'zoom-in'")
  })

  test('uses native W2UI toolbar composition instead of per-item sizing hacks', () => {
    expect(source).toContain("id: 'fit'")
    expect(source).toContain("id: 'zoom-out'")
    expect(source).toContain("id: 'zoom-in'")
    expect(source).toContain("type: 'break'")
    expect(source).not.toContain('min-width: 32px')
    expect(source).not.toContain('height: 34px; min-height: 34px;')
    expect(source).not.toContain("id: 'zoom-level'")
    expect(source).not.toContain('publication-zoom-level')
  })

  test('uses a native menu-check to expose Viewer display state', () => {
    expect(source).toContain("id: 'view'")
    expect(source).toContain("type: 'menu-check'")
    expect(source).toContain("selected: [ 'properties' ]")
    expect(source).toContain("{ id: 'properties', text: 'Properties' }")
    expect(source).toContain("layout?.hide('right', true)")
    expect(source).toContain("layout?.show('right', true)")
  })
})

describe('VIEW-BRAND-01 publication branding contract', () => {
  test('segregates the BPMN viewport and branding with a nested native W2UI layout', () => {
    expect(source).toContain("name: 'publication_process_content_layout'")
    expect(source).toContain('id="publication-process-content-layout"')
    expect(source).toContain("box: '#publication-process-content-layout'")
    expect(source).toContain('style="position:absolute; inset:0; overflow:hidden;"')
    expect(source).toContain('contentLayout.resize()')
    expect(source).not.toContain("box: layout.el('main')")
    expect(source).toMatch(/type:\s*'bottom'[\s\S]*size:\s*BRANDING_PANEL_SIZE/)
    expect(source).toContain("contentLayout.el('main').innerHTML")
    expect(source).toContain("contentLayout.el('bottom').innerHTML")
    expect(source).toContain('id="publication-brand-bpmnsm"')
    expect(source).toContain('id="publication-content-provider"')
  })

  test('uses a centered native W2UI popup for BPMNSM branding', () => {
    expect(source).toContain('w2popup')
    expect(source).toContain('w2popup.open({')
    expect(source).toContain("title: 'BPMNSM'")
    expect(source).toContain('https://github.com/nfigay/Semantic-Process-Mediator')
    expect(source).not.toContain('w2overlay')
  })

  test('does not manipulate the native bpmn.io watermark', () => {
    expect(source).not.toContain('.bjs-powered-by')
    expect(source).not.toContain('bjs-powered-by')
  })
})
