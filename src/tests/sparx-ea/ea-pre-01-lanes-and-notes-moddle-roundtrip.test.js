import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { BpmnModdle } from 'bpmn-moddle'

import semarchModdle from '../../extensions/semarch.json'
import {
  normalizeSparxEaImport
} from '../../platforms/sparx-ea/preprocessing/normalize-import.js'

const fixture = name => readFileSync(
  fileURLToPath(
    new URL(
      `./EA-PRE-01/cases/lanes-and-notes-001/input/${name}`,
      import.meta.url
    )
  ),
  'utf8'
)

const bpmnXml =
  fixture('EA-PRE-01-LANES-NOTES-001-BPMN20.xml')

const xmiXml =
  fixture('EA-PRE-01-LANES-NOTES-001-XMI251.xml')

const PROCESS =
  'EAID_A88AFCBF_F05D_4311_AFC9_05A2261AC17C'

const TEXT_ANNOTATION =
  'EAID_58638261_8A71_4101_A0A5_9B387356C427'

const ACTIVITY_D =
  'EAID_AF9565B9_A280_4cdb_81C3_B9FAE9BE0778'

const ASSOCIATION =
  'EAID_FC45DD95_05A4_4832_ADE9_E0125D2BCCBF'

function createModdle() {
  return new BpmnModdle({
    semarch: semarchModdle
  })
}

function elementById(imported, id) {
  return imported.elementsById[id]
}

function assertNormalizedModel(imported) {
  const process =
    elementById(imported, PROCESS)

  const textAnnotation =
    elementById(imported, TEXT_ANNOTATION)

  const activityD =
    elementById(imported, ACTIVITY_D)

  const association =
    elementById(imported, ASSOCIATION)

  expect(process?.$type).toBe('bpmn:Process')

  expect(process.laneSets).toHaveLength(1)

  expect(
    process.laneSets[0].lanes.map(lane => lane.name)
  ).toEqual([
    'Lane One',
    'Lane Two',
    'Lane Three'
  ])

  expect(textAnnotation).toBeTruthy()
  expect(textAnnotation.$type).toBe('bpmn:TextAnnotation')
  expect(textAnnotation.text).toBe('Text Annotation BPMN')

  expect(activityD).toBeTruthy()

  expect(association?.$type).toBe('bpmn:Association')
  expect(association.sourceRef).toBe(textAnnotation)
  expect(association.targetRef).toBe(activityD)

  const shapes =
    imported.rootElement.diagrams.flatMap(
      diagram =>
        diagram.plane?.planeElement || []
    )

  const textAnnotationShape =
    shapes.find(
      element =>
        element.$type === 'bpmndi:BPMNShape' &&
        element.bpmnElement === textAnnotation
    )

  expect(textAnnotationShape).toBeTruthy()
}

describe(
  'EA-PRE-01 normalized BPMN — BPMNSM moddle round-trip',
  () => {

    it(
      'is consumed by the BPMNSM BPMN moddle with repaired semantics and DI',
      async () => {

        const normalized =
          normalizeSparxEaImport({
            bpmnXml,
            xmiXml
          })

        const imported =
          await createModdle().fromXML(
            normalized.bpmnXml
          )

        assertNormalizedModel(imported)
      }
    )

    it(
      'preserves the repaired model through serialization and a second import',
      async () => {

        const normalized =
          normalizeSparxEaImport({
            bpmnXml,
            xmiXml
          })

        const firstModdle =
          createModdle()

        const first =
          await firstModdle.fromXML(
            normalized.bpmnXml
          )

        const serialized =
          await firstModdle.toXML(
            first.rootElement,
            {
              format: true
            }
          )

        const second =
          await createModdle().fromXML(
            serialized.xml
          )

        assertNormalizedModel(second)
      }
    )
  }
)
