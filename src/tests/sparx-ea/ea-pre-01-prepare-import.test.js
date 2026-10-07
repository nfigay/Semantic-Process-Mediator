import {
  readFileSync
} from 'node:fs'

import {
  fileURLToPath
} from 'node:url'

import {
  describe,
  expect,
  it
} from 'vitest'

import {
  prepareSparxEaBpmnImport
} from '../../platforms/sparx-ea/preprocessing/prepare-import.js'


const fixture =
  name =>
    readFileSync(
      fileURLToPath(
        new URL(
          `./EA-PRE-01/cases/lanes-and-notes-001/input/${name}`,
          import.meta.url
        )
      ),
      'utf8'
    )


const bpmnXml =
  fixture(
    'EA-PRE-01-LANES-NOTES-001-BPMN20.xml'
  )


const xmiXml =
  fixture(
    'EA-PRE-01-LANES-NOTES-001-XMI251.xml'
  )


const TEXT_ANNOTATION =
  'EAID_58638261_8A71_4101_A0A5_9B387356C427'

const UML_NOTE =
  'EAID_1650C289_F839_43b4_86D7_C88C8BC2DF61'

const NOTE_LINK =
  'EAID_3CAA5756_31EC_4870_BD52_3F23DF71A79A'

const ACTIVITY_D =
  'EAID_AF9565B9_A280_4cdb_81C3_B9FAE9BE0778'


describe(
  'EA-PRE-01 — assisted Sparx EA BPMN import preparation',
  () => {

    const prepared =
      prepareSparxEaBpmnImport({
        bpmnXml,
        xmiXml
      })


    it(
      'preserves the raw EA artifacts separately from the normalized BPMN',
      () => {

        expect(
          prepared.source.bpmnXml
        ).toBe(
          bpmnXml
        )

        expect(
          prepared.source.xmiXml
        ).toBe(
          xmiXml
        )

        expect(
          prepared.normalizedBpmnXml
        ).not.toBe(
          bpmnXml
        )
      }
    )


    it(
      'reports the deterministic TextAnnotation repair',
      () => {

        expect(
          prepared.repairs
        ).toEqual([
          {
            type:
              'restore-bpmn-text-annotation',

            id:
              TEXT_ANNOTATION,

            associationId:
              'EAID_FC45DD95_05A4_4832_ADE9_E0125D2BCCBF',

            source:
              'supporting-xmi'
          }
        ])
      }
    )


    it(
      'removes the repaired TextAnnotation semantic and DI reference errors',
      () => {

        expect(
          prepared.normalizedAnalysis
            .bpmn
            .unresolvedAssociationReferences
        ).toEqual(
          []
        )

        expect(
          prepared.normalizedAnalysis
            .bpmn
            .unresolvedDiReferences
            .some(
              issue =>
                issue.bpmnElement ===
                TEXT_ANNOTATION
            )
        ).toBe(
          false
        )
      }
    )


    it(
      'keeps the native UML Note outside deterministic BPMN repair',
      () => {

        expect(
          prepared.normalizedAnalysis
            .bpmn
            .unresolvedDiReferences
        ).toEqual([
          expect.objectContaining({
            kind:
              'BPMNShape',

            bpmnElement:
              UML_NOTE
          })
        ])


        expect(
          prepared.unresolvedIssues
        ).toEqual([
          expect.objectContaining({
            type:
              'unresolved-bpmndi-reference',

            bpmnElement:
              UML_NOTE
          })
        ])
      }
    )


    it(
      'exposes the native UML Note and its NoteLink as an explicit publication-policy concern',
      () => {

        expect(
          prepared.publicationPolicyRequired
            .nativeNotes
        ).toEqual([
          {
            id:
              UML_NOTE,

            text:
              'UML Note with link',

            noteLinks: [
              {
                id:
                  NOTE_LINK,

                start:
                  UML_NOTE,

                end:
                  ACTIVITY_D,

                sourceOccurrenceCount:
                  2
              }
            ]
          }
        ])
      }
    )


    it(
      'records platform and transformation provenance without changing the Repository contract',
      () => {

        expect(
          prepared.provenance
        ).toEqual({
          platform:
            'sparx-ea',

          transformation:
            'ea-bpmn-import-preprocessing',

          supportingArtifact:
            'ea-xmi'
        })
      }
    )
  }
)
