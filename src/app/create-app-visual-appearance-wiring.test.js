import { describe, expect, it } from 'vitest'
import fs from 'node:fs'

const source = fs.readFileSync(
  new URL('./create-app.js', import.meta.url),
  'utf8'
)

describe('VIS-STYLE-001 active createApp wiring', () => {
  it('mounts the BPMNSM visual appearance panel in the active Editor', () => {
    expect(source).toContain(
      "from '../ui/visual-properties-panel.js'"
    )
    expect(source).toContain(
      'id="visual-props"'
    )
    expect(source).toContain(
      "querySelector(\n        '#visual-props'"
    )
    expect(source).toContain(
      'createVisualPropertiesPanel({'
    )
    expect(source).toContain(
      'visualPropertiesContainer'
    )
  })

  it('does not expose the appearance editor in Viewer mode', () => {
    expect(source).toMatch(
      /!isViewerMode\(\s*appMode\s*\)/
    )
    expect(source).toMatch(
      /editable:\s*true/
    )
  })

  it('gates Appearance through the authoritative Diagram navigation context', () => {
    expect(source).toContain(
      "layout.navigation ===\n        'diagrams'"
    )
    expect(source).toContain(
      'layout.onNavigationChange?.('
    )
    expect(source).toContain(
      "navigation !==\n        'diagrams'"
    )
    expect(source).toContain(
      "visualPropertiesPanel\n          ?.hide()"
    )
    expect(source).toContain(
      "visualPropertiesPanel\n          ?.show(selection)"
    )
  })

})
