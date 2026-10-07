import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { analyzeSparxEaImport } from '../../platforms/sparx-ea/preprocessing/analyze-import.js'
import { normalizeSparxEaImport } from '../../platforms/sparx-ea/preprocessing/normalize-import.js'

const fixture = name => readFileSync(
  fileURLToPath(new URL(`./EA-PRE-01/cases/lanes-and-notes-001/input/${name}`, import.meta.url)),
  'utf8'
)

const bpmnXml = fixture('EA-PRE-01-LANES-NOTES-001-BPMN20.xml')
const xmiXml = fixture('EA-PRE-01-LANES-NOTES-001-XMI251.xml')

const TEXT_ANNOTATION = 'EAID_58638261_8A71_4101_A0A5_9B387356C427'
const UML_NOTE = 'EAID_1650C289_F839_43b4_86D7_C88C8BC2DF61'
const ASSOCIATION = 'EAID_FC45DD95_05A4_4832_ADE9_E0125D2BCCBF'
const NOTE_LINK = 'EAID_3CAA5756_31EC_4870_BD52_3F23DF71A79A'
const NOTE_LINK_EDGE = 'EAID_B6B32B78_51A8_4843_BD52_3F23DF71A79A'

const normalized = normalizeSparxEaImport({ bpmnXml, xmiXml })
const analysis = analyzeSparxEaImport({ bpmnXml: normalized.bpmnXml, xmiXml })

describe('EA-PRE-01 deterministic TextAnnotation normalization', () => {
  it('records one evidence-backed repair', () => {
    expect(normalized.repairs).toEqual([{
      type: 'restore-bpmn-text-annotation',
      id: TEXT_ANNOTATION,
      associationId: ASSOCIATION,
      source: 'supporting-xmi'
    }])
  })

  it('restores the lost BPMN TextAnnotation with its EA identity and text', () => {
    expect(analysis.bpmn.semanticIds).toContain(TEXT_ANNOTATION)
    expect(normalized.bpmnXml).toContain(`id="${TEXT_ANNOTATION}"`)
    expect(normalized.bpmnXml).toContain('<bpmn:text>Text Annotation BPMN</bpmn:text>')
  })

  it('resolves the existing BPMN Association without replacing it', () => {
    expect(analysis.bpmn.unresolvedAssociationReferences).toEqual([])
    expect(analysis.bpmn.associations).toEqual([
      expect.objectContaining({ id: ASSOCIATION, sourceRef: TEXT_ANNOTATION, sourceResolved: true, targetResolved: true })
    ])
  })

  it('resolves the TextAnnotation BPMNShape through the restored semantic element', () => {
    expect(analysis.bpmn.unresolvedDiReferences).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ bpmnElement: TEXT_ANNOTATION })])
    )
  })

  it('does not silently convert the native UML Note', () => {
    expect(analysis.bpmn.semanticIds).not.toContain(UML_NOTE)
    expect(analysis.bpmn.unresolvedDiReferences).toEqual([
      expect.objectContaining({ kind: 'BPMNShape', bpmnElement: UML_NOTE })
    ])
  })

  it('leaves publication policy for the UML Note as the only blocking issue', () => {
    expect(analysis.blockingIssues).toEqual([
      expect.objectContaining({ type: 'unresolved-bpmndi-reference', bpmnElement: UML_NOTE })
    ])
    expect(analysis.warnings).toEqual([])
  })
})


describe('EA-PRE-01 native UML Note publication policy DI normalization', () => {
  it('converts the EA NoteLink into a BPMN Association with a BPMNEdge restored from the XMI UMLEdge', () => {
    const converted = normalizeSparxEaImport({
      bpmnXml,
      xmiXml,
      nativeNotePolicy: { [UML_NOTE]: 'convert' }
    })
    const convertedAnalysis = analyzeSparxEaImport({
      bpmnXml: converted.bpmnXml,
      xmiXml
    })

    expect(convertedAnalysis.bpmn.associations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: NOTE_LINK,
          sourceRef: UML_NOTE,
          targetResolved: true
        })
      ])
    )
    expect(convertedAnalysis.bpmn.diReferences).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'BPMNEdge',
          id: NOTE_LINK_EDGE,
          bpmnElement: NOTE_LINK,
          resolved: true
        })
      ])
    )
    expect(converted.bpmnXml).toContain('<di:waypoint x="368" y="291"/>')
    expect(converted.bpmnXml).toContain('<di:waypoint x="357" y="227"/>')
    expect(convertedAnalysis.bpmn.unresolvedDiReferences).toEqual([])
  })

  it('keeps the NoteLink BPMNEdge absent when the native UML Note is excluded', () => {
    const excluded = normalizeSparxEaImport({
      bpmnXml,
      xmiXml,
      nativeNotePolicy: { [UML_NOTE]: 'exclude' }
    })
    const excludedAnalysis = analyzeSparxEaImport({
      bpmnXml: excluded.bpmnXml,
      xmiXml
    })

    expect(excluded.bpmnXml).not.toContain(`bpmnElement="${NOTE_LINK}"`)
    expect(excludedAnalysis.bpmn.semanticIds).not.toContain(UML_NOTE)
    expect(excludedAnalysis.bpmn.unresolvedDiReferences).toEqual([])
  })
})
