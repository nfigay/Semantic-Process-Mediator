import {
  readFileSync
} from 'node:fs'

import {
  fileURLToPath
} from 'node:url'

import {
  describe,
  expect,
  it,
  vi
} from 'vitest'

import { BpmnModdle } from 'bpmn-moddle'

import semarchDescriptor
  from '../../extensions/semarch.json'

import {
  importSparxEaBpmn
} from '../../platforms/sparx-ea/import-sparx-ea-bpmn.js'


const fixtureUrl =
  new URL(
    './EA-PRE-01/cases/colors-001/input/',
    import.meta.url
  )


function readFixture(
  fileName
) {

  return readFileSync(
    fileURLToPath(
      new URL(
        fileName,
        fixtureUrl
      )
    ),
    'utf8'
  )
}


describe(
  'EA-PRE-01 Sparx EA color product import',
  () => {

    it(
      'imports autonomous normalized BPMN with EA diagram colors',
      async () => {

        const bpmnXml =
          readFixture(
            'EA-PRE-01-COLORS non default-BPMN20.xml'
          )

        const xmiXml =
          readFixture(
            'EA-PRE-01-COLORS non default-XMI251.xml'
          )

        const documents = []
        const components = []
        const references = []

        const repository = {

          workspace: {
            mode:
              'memory'
          },

          documents: {

            addDocument(
              document
            ) {

              documents.push(
                document
              )

              return document
            }
          },

          model: {

            getComponent(
              componentId
            ) {

              return (
                components.find(
                  component =>
                    component.id ===
                      componentId
                ) ||
                null
              )
            },

            addComponent(
              component
            ) {

              components.push(
                component
              )

              return component
            },

            getReference(
              referenceId
            ) {

              return (
                references.find(
                  reference =>
                    reference.id ===
                      referenceId
                ) ||
                null
              )
            },

            addReference(
              reference
            ) {

              references.push(
                reference
              )

              return reference
            }
          }
        }

        const moddle =
          new BpmnModdle({
            semarch:
              semarchDescriptor
          })

        let definitions =
          null

        let loadedXml =
          null

        const diagramActions = {

          async loadDiagram(
            xml
          ) {

            loadedXml =
              xml

            const result =
              await moddle.fromXML(
                xml
              )

            definitions =
              result.rootElement
          }
        }

        const modeler = {

          getDefinitions() {

            return definitions
          }
        }

        const repositoryBrowser = {
          render:
            vi.fn()
        }

        const result =
          await importSparxEaBpmn({

            bpmnXml,

            xmiXml,

            fileName:
              'EA-PRE-01-COLORS non default-BPMN20.xml',

            repository,

            diagramActions,

            modeler,

            repositoryBrowser,

            documentId:
              'ea-pre-01-colors-import'
          })

        expect(
          result.requiresPublicationPolicy
        ).toBe(
          false
        )

        expect(
          documents
        ).toHaveLength(
          1
        )

        const repositoryDocument =
          documents[0]

        expect(
          repositoryDocument.fileName
        ).toBe(
          'EA-PRE-01-COLORS non default-BPMN20.bpmn'
        )

        expect(
          repositoryDocument.content
        ).toBe(
          loadedXml
        )

        expect(
          repositoryDocument.content
        ).toContain(
          'xmlns:bioc="http://bpmn.io/schema/bpmn/biocolor/1.0"'
        )

        const expectedColors = [
          '#A9A9A9',
          '#00BFFF',
          '#00FF00',
          '#0000CD',
          '#1E90FF',
          '#FFA500',
          '#191970',
          '#0000FF',
          '#CD853F',
          '#FF1493'
        ]

        for (
          const color
          of expectedColors
        ) {

          expect(
            repositoryDocument.content
          ).toContain(
            color
          )
        }

        expect(
          result.prepared.normalizedBpmnXml
        ).toBe(
          repositoryDocument.content
        )

        expect(
          result.prepared.unresolvedIssues
        ).toEqual(
          []
        )

        expect(
          repositoryBrowser.render
        ).toHaveBeenCalledTimes(
          1
        )

        expect(
          components.length
        ).toBeGreaterThan(
          0
        )
      }
    )
  }
)
