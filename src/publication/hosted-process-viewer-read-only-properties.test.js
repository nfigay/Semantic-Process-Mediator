import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'

const root = process.cwd()

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

describe('hosted process viewer read-only properties contract', () => {
  test('reuses the Editor modeler and Properties providers with mutation disabled', () => {
    const source = read('src/publication/hosted-process-viewer.js')

    expect(source).toContain("from '../bpmn/create-modeler.js'")
    expect(source).toContain("from '../bpmn/apply-bpmn-capabilities.js'")
    expect(source).toContain('viewer = createModeler({')
    expect(source).toContain('propertiesPanel: propertiesContainer')
    expect(source).toContain('applyBpmnCapabilities({')
    expect(source).toContain('editable: false')

    expect(source).not.toContain("from '../bpmn/create-viewer.js'")
    expect(source).not.toContain("from '../ui/read-only-properties-panel.js'")
    expect(source).not.toContain('createReadOnlyPropertiesPanel')
  })

  test('renders the shared Properties surface through the W2UI workspace', () => {
    const html = read('viewer/process/index.html')
    const workspace = read('src/publication/hosted-process-viewer-workspace.js')

    expect(html).toContain('id="publication-shell"')
    expect(workspace).toContain('id="publication-viewer"')
    expect(workspace).toContain('id="publication-properties"')
    expect(workspace).toContain('aria-label="Read-only process properties"')
    expect(html).toContain('#publication-status[data-state="ready"] { display: none; }')
  })
})
