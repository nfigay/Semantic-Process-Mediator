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
    './EA-PRE-01/cases/lanes-and-notes-001/input/',
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
  'EA-PRE-01 Sparx EA functional product import',
  () => {

    it(
      'defers Repository projection until native-note publication policy is resolved',
      async () => {

        const bpmnXml =
          readFixture(
            'EA-PRE-01-LANES-NOTES-001-BPMN20.xml'
          )

        const xmiXml =
          readFixture(
            'EA-PRE-01-LANES-NOTES-001-XMI251.xml'
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


        const pendingResult =
          await importSparxEaBpmn({

            bpmnXml,

            xmiXml,

            fileName:
              'EA-PRE-01-LANES-NOTES-001.bpmn',

            repository,

            diagramActions,

            modeler,

            repositoryBrowser,

            documentId:
              'ea-pre-01-import'
          })


        expect(
          pendingResult.requiresPublicationPolicy
        ).toBe(
          true
        )


        expect(
          documents
        ).toHaveLength(
          0
        )


        expect(
          repositoryBrowser.render
        ).not.toHaveBeenCalled()


        const result =
          await importSparxEaBpmn({

            bpmnXml,

            xmiXml,

            fileName:
              'EA-PRE-01-LANES-NOTES-001.bpmn',

            repository,

            diagramActions,

            modeler,

            repositoryBrowser,

            documentId:
              'ea-pre-01-import',

            nativeNotePolicy: {
              EAID_1650C289_F839_43b4_86D7_C88C8BC2DF61:
                'exclude'
            }
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
          repositoryDocument
            .content
        ).toBe(
          loadedXml
        )


        expect(
          repositoryDocument
            .content
        ).toContain(
          '<bpmn:textAnnotation id="EAID_58638261_8A71_4101_A0A5_9B387356C427">'
        )


        expect(
          repositoryDocument
            .content
        ).toContain(
          'Text Annotation BPMN'
        )


        expect(
          repositoryDocument
            .content
        ).not.toContain(
          'UML Note with link'
        )


        const process =
          definitions.rootElements
            .find(
              element =>
                element.$type ===
                'bpmn:Process'
            )


        expect(
          process.laneSets[0]
            .lanes
        ).toHaveLength(
          3
        )


        const association =
          process.artifacts
            .find(
              artifact =>
                artifact.$type ===
                  'bpmn:Association'
            )


        expect(
          association.sourceRef.id
        ).toBe(
          'EAID_58638261_8A71_4101_A0A5_9B387356C427'
        )


        expect(
          association.targetRef.id
        ).toBe(
          'EAID_AF9565B9_A280_4cdb_81C3_B9FAE9BE0778'
        )


        expect(
          result.prepared.repairs
        ).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type:
                'restore-bpmn-text-annotation',

              id:
                'EAID_58638261_8A71_4101_A0A5_9B387356C427'
            })
          ])
        )


        expect(
          result.prepared
            .publicationPolicyRequired
            .nativeNotes
        ).toEqual(
          []
        )


        expect(
          result.prepared
            .unresolvedIssues
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
