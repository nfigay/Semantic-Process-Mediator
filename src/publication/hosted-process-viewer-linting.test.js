import {
  describe,
  expect,
  it
} from 'vitest'

import fs
  from 'node:fs'

const createModelerSource =
  fs.readFileSync(
    new URL(
      '../bpmn/create-modeler.js',
      import.meta.url
    ),
    'utf8'
  )

const hostedViewerSource =
  fs.readFileSync(
    new URL(
      './hosted-process-viewer.js',
      import.meta.url
    ),
    'utf8'
  )

describe(
  'Hosted Process Viewer linting capability',
  () => {

    it(
      'keeps linting enabled by default for shared modeler consumers',
      () => {

        expect(
          createModelerSource
        ).toContain(
          'linting = true'
        )

        expect(
          createModelerSource
        ).toContain(
          '...(linting ? [ lintModule ] : [])'
        )
      }
    )

    it(
      'disables construction linting in the Hosted Viewer',
      () => {

        expect(
          hostedViewerSource
        ).toMatch(
          /capabilities\s*:\s*\{[\s\S]*?linting\s*:\s*false/
        )
      }
    )

    it(
      'does not install the lint module when linting is disabled',
      () => {

        expect(
          createModelerSource
        ).not.toContain(
          'BpmnPropertiesProviderModule,\n      lintModule,'
        )
      }
    )
  }
)
