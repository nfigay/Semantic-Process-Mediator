import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { analyzeSparxEaImport } from '../../platforms/sparx-ea/preprocessing/analyze-import.js'

const fixture = name => readFileSync(
  fileURLToPath(new URL(`./EA-PRE-01/cases/starter-process-notes-001/input/${name}`, import.meta.url)),
  'utf8'
)

const bpmnXml = fixture('EA-PRE-01-Starter-Process-BPMN20.xml')
const xmiXml = fixture('EA-PRE-01-Starter-Process-XMI251.xml')

const TEXT_ANNOTATION = 'EAID_F5A78000_FE83_41f1_B2E8_32134E6AA6BE'
const UML_NOTE = 'EAID_C26CDC3B_2F87_45d7_AB18_3BECA82DED8A'
const PROCESS_A = 'EAID_9100BB20_5933_4e66_9830_D4DA02D46A0B'
const ASSOCIATION = 'EAID_E2C81FB9_7610_49a2_9B06_E127BD5745DB'

const analysis = analyzeSparxEaImport({ bpmnXml, xmiXml })

describe('EA-PRE-01 starter process import diagnostic', () => {
  it('distinguishes the BPMN TextAnnotation from the native UML/EA Note in XMI', () => {
    const bpmnNote = analysis.xmi.notes.find(note => note.id === TEXT_ANNOTATION)
    const umlNote = analysis.xmi.notes.find(note => note.id === UML_NOTE)

    expect(bpmnNote).toMatchObject({
      sourceKind: 'bpmn-text-annotation',
      stereotype: 'BPMN2.0::TextAnnotation',
      text: 'BPMN Annotatio'
    })
    expect(bpmnNote.dependencies).toContainEqual(expect.objectContaining({ id: ASSOCIATION }))

    expect(umlNote).toMatchObject({
      sourceKind: 'uml-note',
      stereotype: null,
      text: 'Double-click the Business Process to show the Process Diagram'
    })
    expect(umlNote.noteLinks).toHaveLength(1)
    expect(umlNote.noteLinks[0]).toMatchObject({
      sourceOccurrenceCount: 2
    })
  })

  it('detects the lost semantic TextAnnotation referenced by the exported Association', () => {
    expect(analysis.bpmn.unresolvedAssociationReferences).toContainEqual({
      associationId: ASSOCIATION,
      role: 'sourceRef',
      ref: TEXT_ANNOTATION
    })
  })

  it('detects both dangling BPMNShape references emitted by EA', () => {
    const unresolved = analysis.bpmn.unresolvedDiReferences.map(reference => reference.bpmnElement)
    expect(unresolved).toEqual(expect.arrayContaining([TEXT_ANNOTATION, UML_NOTE]))
    expect(unresolved).toHaveLength(2)
  })

  it('detects the independent duplicate BPMNPlane anomaly for Process A', () => {
    expect(analysis.bpmn.multiplePlanes).toEqual([
      {
        bpmnElement: PROCESS_A,
        planeIds: [
          'EAID_PL000000_0FDB_49c7_9465_AEC28F2FD643',
          'EAID_PL000000_3BCE_4951_8642_0577DB1877D0'
        ]
      }
    ])
  })

  it('keeps duplicate planes separate from reference errors', () => {
    expect(analysis.blockingIssues.map(issue => issue.type)).toEqual([
      'unresolved-bpmn-reference',
      'unresolved-bpmndi-reference',
      'unresolved-bpmndi-reference'
    ])
    expect(analysis.warnings).toEqual([
      expect.objectContaining({ type: 'multiple-bpmn-planes', bpmnElement: PROCESS_A })
    ])
  })

  it('requests XMI support when the same malformed BPMN is imported alone', () => {
    const bpmnOnly = analyzeSparxEaImport({ bpmnXml })
    expect(bpmnOnly.requiresSupportingXmi).toBe(true)
    expect(bpmnOnly.xmi).toBeNull()
  })
})
