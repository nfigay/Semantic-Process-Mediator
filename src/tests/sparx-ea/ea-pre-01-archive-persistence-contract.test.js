import {
  readFileSync
} from 'node:fs'

import {
  describe,
  expect,
  it
} from 'vitest'


describe(
  'EA-PRE-01 Repository archive persistence contract',
  () => {

    it(
      'materializes normalized EA XML input under an unambiguous .bpmn Repository path',
      () => {

        const source =
          readFileSync(
            new URL(
              '../../platforms/sparx-ea/import-sparx-ea-bpmn.js',
              import.meta.url
            ),
            'utf8'
          )


        expect(
          source
        ).toContain(
          'resolveRepositoryBpmnFileName'
        )


        expect(
          source
        ).toMatch(
          /replace\(\s*\/\\\.xml\$\/i,\s*'\.bpmn'\s*\)/
        )


        expect(
          source
        ).toMatch(
          /fileName:\s*resolveRepositoryBpmnFileName\(\s*fileName\s*\)/
        )
      }
    )
  }
)
