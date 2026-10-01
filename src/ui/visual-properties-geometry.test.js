import {
  describe,
  expect,
  it,
  vi
} from 'vitest'

import { readFileSync } from 'node:fs'

const source = readFileSync(
  new URL(
    './visual-properties-panel.js',
    import.meta.url
  ),
  'utf8'
)

describe(
  'VIS-STYLE-001 visual properties geometry',
  () => {
    it(
      'routes position mutations through bpmn.io modeling.moveShape',
      () => {
        expect(source).toContain(
          "['x', 'y', 'width', 'height'].includes(target)"
        )

        expect(source).toContain(
          "modeling.moveShape("
        )

        expect(source).toContain(
          "value - element.x"
        )

        expect(source).toContain(
          "value - element.y"
        )
      }
    )

    it(
      'routes size mutations through bpmn.io modeling.resizeShape',
      () => {
        expect(source).toContain(
          "modeling.resizeShape("
        )

        expect(source).toContain(
          "width:"
        )

        expect(source).toContain(
          "height:"
        )

        expect(source).toContain(
          "newBounds.width > 0"
        )

        expect(source).toContain(
          "newBounds.height > 0"
        )
      }
    )

    it(
      'does not use direct SVG or BPMN DI geometry mutation',
      () => {
        expect(source).not.toMatch(
          /\.setAttribute\s*\(/
        )

        expect(source).not.toMatch(
          /\.style\.(?:left|top|width|height)\s*=/
        )

        expect(source).not.toMatch(
          /getDi\([^)]*\)\.(?:x|y|width|height)\s*=/
        )
      }
    )

    it(
      'keeps color mutations on modeling.setColor',
      () => {
        expect(source).toContain(
          "modeler.get('modeling').setColor("
        )
      }
    )
  }
)
