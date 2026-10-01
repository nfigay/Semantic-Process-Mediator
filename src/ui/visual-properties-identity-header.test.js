import {
  describe,
  expect,
  it
} from 'vitest'

import fs from 'node:fs'

const source =
  fs.readFileSync(
    new URL(
      './visual-properties-panel.js',
      import.meta.url
    ),
    'utf8'
  )

describe(
  'Visual Properties BPMN identity header',
  () => {
    it(
      'projects identity from the selected BPMN businessObject',
      () => {
        expect(source).toContain(
          "element.businessObject || null"
        )

        expect(source).toContain(
          'businessObject?.$type'
        )

        expect(source).toContain(
          'businessObject?.name'
        )

        expect(source).toContain(
          'businessObject?.id'
        )
      }
    )

    it(
      'keeps identity separate from editable W2UI visual fields',
      () => {
        expect(source).toContain(
          "document.createElement('div')"
        )

        expect(source).toContain(
          'bpmnsm-visual-properties-identity'
        )

        expect(source).toContain(
          'bpmnsm-visual-properties-form'
        )

        expect(source).toContain(
          'form.render(formContainer)'
        )
      }
    )

    it(
      'does not mutate BPMN semantic identity',
      () => {
        const identityBlock =
          source.slice(
            source.indexOf(
              "const identityHeader"
            ),
            source.indexOf(
              "const form = new w2form"
            )
          )

        expect(identityBlock).not.toContain(
          'updateProperties'
        )

        expect(identityBlock).not.toContain(
          'updateModdleProperties'
        )
      }
    )
  }
)
