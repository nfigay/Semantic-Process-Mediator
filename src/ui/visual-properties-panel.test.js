import { describe, expect, it } from 'vitest'
import fs from 'node:fs'

const source = fs.readFileSync(
  new URL('./visual-properties-panel.js', import.meta.url),
  'utf8'
)

const modelerSource = fs.readFileSync(
  new URL('../bpmn/create-modeler.js', import.meta.url),
  'utf8'
)

const mainSource = fs.readFileSync(
  new URL('../main.js', import.meta.url),
  'utf8'
)

const packageJson = JSON.parse(
  fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8')
)

const lockJson = JSON.parse(
  fs.readFileSync(new URL('../../package-lock.json', import.meta.url), 'utf8')
)

describe('VIS-STYLE-001 visual appearance editor', () => {
  it('uses the BPMNSM W2UI form and advanced native color fields', () => {
    expect(source).toContain("import { w2form } from 'w2ui'")
    expect(source).toContain("type: 'color'")
    expect(source).toContain('advanced: true')
    expect(source).toContain('focus: -1')
  })

  it('edits presentation through bpmn-js modeling rather than SVG state', () => {
    expect(source).toContain("modeler.get('modeling').setColor")
    expect(source).toContain('normalizeW2Color')
    expect(source).toContain('`#${color}`')
    expect(source).toContain("'background-color'")
    expect(source).toContain("'border-color'")
  })

  it('removes the deprecated community color-picker integration', () => {
    expect(packageJson.dependencies['bpmn-js-color-picker']).toBeUndefined()
    expect(lockJson.packages['node_modules/bpmn-js-color-picker']).toBeUndefined()
    expect(modelerSource).not.toContain('bpmn-js-color-picker')
    expect(mainSource).not.toContain('bpmn-js-color-picker')
  })

  it('projects BPMN shape geometry without directly mutating DI or SVG', () => {
    expect(source).toContain("field: 'x'")
    expect(source).toContain("field: 'y'")
    expect(source).toContain("field: 'width'")
    expect(source).toContain("field: 'height'")

    expect(source).toContain(
      "group: 'Geometry'"
    )

    expect(source).toContain(
      "group: 'Appearance'"
    )

    expect(source).toContain(
      "x: connection ? '' : element.x ?? ''"
    )

    expect(source).not.toContain(
      "businessObject.di.bounds.x ="
    )

    expect(source).not.toContain(
      "setAttribute("
    )
  })

})
