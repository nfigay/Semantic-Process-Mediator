import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { analyzeSparxEaImport } from '../../platforms/sparx-ea/preprocessing/analyze-import.js'

const fixture = name => readFileSync(
  fileURLToPath(new URL(`./EA-PRE-01/cases/lanes-and-notes-001/input/${name}`, import.meta.url)),
  'utf8'
)

const bpmnXml = fixture('EA-PRE-01-LANES-NOTES-001-BPMN20.xml')
const xmiXml = fixture('EA-PRE-01-LANES-NOTES-001-XMI251.xml')

const TEXT_ANNOTATION = 'EAID_58638261_8A71_4101_A0A5_9B387356C427'
const UML_NOTE = 'EAID_1650C289_F839_43b4_86D7_C88C8BC2DF61'
const ACTIVITY_D = 'EAID_AF9565B9_A280_4cdb_81C3_B9FAE9BE0778'
const ASSOCIATION = 'EAID_FC45DD95_05A4_4832_ADE9_E0125D2BCCBF'
const NOTE_LINK = 'EAID_3CAA5756_31EC_4870_BD52_3F23DF71A79A'

const analysis = analyzeSparxEaImport({ bpmnXml, xmiXml })

describe('EA-PRE-01 lane process with BPMN and UML notes', () => {
  it('distinguishes the BPMN TextAnnotation from the native UML/EA Note in XMI', () => {
    const bpmnNote = analysis.xmi.notes.find(note => note.id === TEXT_ANNOTATION)
    const umlNote = analysis.xmi.notes.find(note => note.id === UML_NOTE)
    expect(bpmnNote).toMatchObject({ sourceKind: 'bpmn-text-annotation', stereotype: 'BPMN2.0::TextAnnotation', text: 'Text Annotation BPMN' })
    expect(bpmnNote.dependencies).toContainEqual({ id: ASSOCIATION, start: TEXT_ANNOTATION, end: ACTIVITY_D })
    expect(umlNote).toMatchObject({ sourceKind: 'uml-note', stereotype: null, text: 'UML Note with link' })
    expect(umlNote.noteLinks).toContainEqual({
      id: NOTE_LINK,
      start: UML_NOTE,
      end: ACTIVITY_D,
      sourceOccurrenceCount: 2
    })
  })

  it('detects the semantic TextAnnotation lost by the EA BPMN export', () => {
    expect(analysis.bpmn.semanticIds).not.toContain(TEXT_ANNOTATION)
    expect(analysis.bpmn.unresolvedAssociationReferences).toEqual([{ associationId: ASSOCIATION, role: 'sourceRef', ref: TEXT_ANNOTATION }])
  })

  it('detects exactly the two dangling BPMNShape references', () => {
    expect(analysis.bpmn.unresolvedDiReferences).toEqual([
      expect.objectContaining({ kind: 'BPMNShape', bpmnElement: TEXT_ANNOTATION }),
      expect.objectContaining({ kind: 'BPMNShape', bpmnElement: UML_NOTE })
    ])
  })

  it('does not reproduce the earlier multiple-BPMNPlane anomaly', () => {
    expect(analysis.bpmn.multiplePlanes).toEqual([])
    expect(analysis.warnings).toEqual([])
  })

  it('classifies the malformed BPMN references as blocking diagnostic issues', () => {
    expect(analysis.blockingIssues.map(issue => issue.type)).toEqual([
      'unresolved-bpmn-reference',
      'unresolved-bpmndi-reference',
      'unresolved-bpmndi-reference'
    ])
  })

  it('requests XMI support when this EA BPMN export is analyzed alone', () => {
    const bpmnOnly = analyzeSparxEaImport({ bpmnXml })
    expect(bpmnOnly.requiresSupportingXmi).toBe(true)
    expect(bpmnOnly.xmi).toBeNull()
  })
})
