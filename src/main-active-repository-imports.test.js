import {
  describe,
  expect,
  it
} from 'vitest'

import fs from 'node:fs'


function extractHandler(
  source,
  startMarker,
  endMarker
) {
  const start =
    source.indexOf(
      startMarker
    )

  const end =
    source.indexOf(
      endMarker,
      start
    )

  if (
    start < 0 ||
    end < 0
  ) {
    throw new Error(
      `Handler boundaries not found: ${startMarker}`
    )
  }

  return source.slice(
    start,
    end
  )
}


describe(
  'main imports — active Repository',
  () => {
    const source =
      fs.readFileSync(
        new URL(
          './main.js',
          import.meta.url
        ),
        'utf8'
      )


    it(
      'imports BPMN into the active Repository',
      () => {
        const handler =
          extractHandler(
            source,
            'importFileInput.setOnLoad(',
            'sparxEaBpmnFileInput.setOnLoad('
          )

        expect(handler).toContain(
          'resolveActiveRepository()'
        )

        expect(handler).toContain(
          'repository.workspace'
        )

        expect(handler).toContain(
          'repository.documents'
        )

        expect(handler).toContain(
          'repository.model'
        )

        expect(handler).not.toMatch(
          /\brepositoryDocumentStore\b/
        )

        expect(handler).not.toMatch(
          /\brepositoryModel\b(?!\s*:)/
        )

        expect(handler).not.toMatch(
          /\bactiveWorkspace\b/
        )
      }
    )


    it(
      'keeps ordinary BPMN import independent from Sparx EA preprocessing',
      () => {
        const handler =
          extractHandler(
            source,
            'importFileInput.setOnLoad(',
            'sparxEaBpmnFileInput.setOnLoad('
          )

        expect(handler).not.toContain(
          'prepareSparxEaBpmnImport'
        )

        expect(handler).not.toContain(
          'xmiXml'
        )

        expect(handler).toContain(
          'content:'
        )

        expect(handler).toContain(
          'xml'
        )
      }
    )


    it(
      'imports Sparx EA BPMN through preprocessing before Repository integration',
      () => {
        const handler =
          extractHandler(
            source,
            'sparxEaBpmnFileInput.setOnLoad(',
            'archimateImportFileInput.setOnLoad('
          )

        expect(handler).toContain(
          'sparxEaXmiFileInput.setOnLoad('
        )

        expect(handler).toContain(
          'await importSparxEaBpmn({'
        )

        expect(handler).toContain(
          'bpmnXml:'
        )

        expect(handler).toContain(
          'pending.bpmnXml'
        )

        expect(handler).toContain(
          'xmiXml'
        )

        expect(handler).toContain(
          'resolveActiveRepository()'
        )

        expect(handler).toContain(
          'repository,'
        )

        expect(handler).toContain(
          'diagramActions,'
        )

        expect(handler).toContain(
          'modeler,'
        )

        expect(handler).toContain(
          'repositoryBrowser,'
        )

        expect(handler).not.toContain(
          'prepareSparxEaBpmnImport'
        )

        expect(handler).not.toContain(
          'repository.documents'
        )

        expect(handler).toMatch(
          /await\s+importSparxEaBpmn\s*\(\s*\{/
        )

        expect(handler).toMatch(
          /bpmnXml:\s*pending\.bpmnXml/
        )

        expect(handler).toContain(
          'xmiXml'
        )

        expect(handler).toContain(
          'repository,'
        )

        expect(handler).toContain(
          'diagramActions,'
        )

        expect(handler).toContain(
          'modeler,'
        )

        expect(handler).toContain(
          'repositoryBrowser,'
        )

        expect(handler).not.toMatch(
          /\.addDocument\s*\(/
        )
      }
    )


    it(
      'imports ArchiMate into the active Repository',
      () => {
        const handler =
          extractHandler(
            source,
            'archimateImportFileInput.setOnLoad(',
            'repositoryFileInput.setOnLoad('
          )

        expect(handler).toContain(
          'resolveActiveRepository()'
        )

        expect(handler).toContain(
          'repository.workspace'
        )

        expect(handler).toContain(
          'repository.documents'
        )

        expect(handler).not.toMatch(
          /\brepositoryDocumentStore\b/
        )

        expect(handler).not.toMatch(
          /\bactiveWorkspace\b/
        )
      }
    )
  }
)
