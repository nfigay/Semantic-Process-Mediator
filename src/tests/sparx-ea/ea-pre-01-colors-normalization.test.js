import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { DOMParser } from '@xmldom/xmldom'
import { describe, expect, it } from 'vitest'
import { normalizeSparxEaImport } from '../../platforms/sparx-ea/preprocessing/normalize-import.js'

const BPMNDI_NS =
  'http://www.omg.org/spec/BPMN/20100524/DI'

const BIOC_NS =
  'http://bpmn.io/schema/bpmn/biocolor/1.0'

const fixture = name => readFileSync(
  fileURLToPath(
    new URL(
      './EA-PRE-01/cases/colors-001/input/' + name,
      import.meta.url
    )
  ),
  'utf8'
)

const bpmnXml =
  fixture('EA-PRE-01-COLORS non default-BPMN20.xml')

const xmiXml =
  fixture('EA-PRE-01-COLORS non default-XMI251.xml')

function diElement(xml, kind, bpmnElement) {
  const document =
    new DOMParser().parseFromString(
      xml,
      'application/xml'
    )

  return Array.from(
    document.getElementsByTagName('*')
  ).find(element =>
    element.namespaceURI === BPMNDI_NS
    && element.localName === kind
    && element.getAttribute('bpmnElement') === bpmnElement
  )
}

function color(element, localName) {
  return element?.getAttributeNS(BIOC_NS, localName)
    || element?.getAttribute('bioc:' + localName)
    || null
}

const START =
  'EAID_2E95ED7B_C6C1_4f05_931B_E0B5903E3D1E'

const END =
  'EAID_C44509AA_2D11_4a1c_A4BD_3A7148AB39F7'

const TASK =
  'EAID_C629377C_AA95_40b6_9D21_089CBBB08107'

const DATA =
  'EAID_0105336A_7CB1_43f9_8769_B5FCCD80F968'

const TASK_TO_END =
  'EAID_BD706633_F925_4854_9A11_594AE279C8AA'

const TASK_TO_DATA =
  'EAID_18374BF8_D3E8_44d7_A25A_A8C1C6276485'

const START_TO_TASK =
  'EAID_D4CB4B96_5270_41c5_8E41_F0582BA1FA82'

const normalized =
  normalizeSparxEaImport({ bpmnXml, xmiXml })

describe('EA-PRE-01 explicit diagram color normalization', () => {
  it('maps each explicit EA shape color to its exact BPMNShape', () => {
    const start =
      diElement(normalized.bpmnXml, 'BPMNShape', START)

    const end =
      diElement(normalized.bpmnXml, 'BPMNShape', END)

    const task =
      diElement(normalized.bpmnXml, 'BPMNShape', TASK)

    const data =
      diElement(normalized.bpmnXml, 'BPMNShape', DATA)

    expect(color(start, 'fill')).toBe('#FFA500')
    expect(color(start, 'stroke')).toBe('#191970')

    expect(color(task, 'fill')).toBe('#00FF00')
    expect(color(task, 'stroke')).toBe('#0000CD')

    expect(color(end, 'fill')).toBe('#1E90FF')
    expect(color(end, 'stroke')).toBeNull()

    expect(color(data, 'fill')).toBe('#A9A9A9')
    expect(color(data, 'stroke')).toBe('#00BFFF')
  })

  it('maps each explicit EA connector color to its exact BPMNEdge', () => {
    const taskToEnd =
      diElement(normalized.bpmnXml, 'BPMNEdge', TASK_TO_END)

    const taskToData =
      diElement(normalized.bpmnXml, 'BPMNEdge', TASK_TO_DATA)

    const startToTask =
      diElement(normalized.bpmnXml, 'BPMNEdge', START_TO_TASK)

    expect(color(taskToEnd, 'stroke')).toBe('#0000FF')
    expect(color(taskToData, 'stroke')).toBe('#CD853F')
    expect(color(startToTask, 'stroke')).toBe('#FF1493')

    expect(color(taskToEnd, 'fill')).toBeNull()
    expect(color(taskToData, 'fill')).toBeNull()
    expect(color(startToTask, 'fill')).toBeNull()
  })

  it('records exactly seven evidence-backed color repairs', () => {
    const colors =
      normalized.repairs.filter(
        repair =>
          repair.type === 'restore-ea-diagram-color'
      )

    expect(colors).toHaveLength(7)

    expect(colors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: START,
          kind: 'BPMNShape',
          fill: '#FFA500',
          stroke: '#191970',
          source: 'supporting-xmi'
        }),
        expect.objectContaining({
          id: TASK,
          kind: 'BPMNShape',
          fill: '#00FF00',
          stroke: '#0000CD',
          source: 'supporting-xmi'
        }),
        expect.objectContaining({
          id: END,
          kind: 'BPMNShape',
          fill: '#1E90FF',
          source: 'supporting-xmi'
        }),
        expect.objectContaining({
          id: DATA,
          kind: 'BPMNShape',
          fill: '#A9A9A9',
          stroke: '#00BFFF',
          source: 'supporting-xmi'
        }),
        expect.objectContaining({
          id: TASK_TO_END,
          kind: 'BPMNEdge',
          stroke: '#0000FF',
          source: 'supporting-xmi'
        }),
        expect.objectContaining({
          id: TASK_TO_DATA,
          kind: 'BPMNEdge',
          stroke: '#CD853F',
          source: 'supporting-xmi'
        }),
        expect.objectContaining({
          id: START_TO_TASK,
          kind: 'BPMNEdge',
          stroke: '#FF1493',
          source: 'supporting-xmi'
        })
      ])
    )

    const endRepair =
      colors.find(repair => repair.id === END)

    expect(endRepair).not.toHaveProperty('stroke')
  })

  it('does not turn EA default appearance into explicit BPMN colors', () => {
    const defaultBpmn =
      fixture('EA-PRE-01-COLORS-BPMN20.xml')

    const defaultXmi =
      fixture('EA-PRE-01-COLORS-XMI251.xml')

    const result =
      normalizeSparxEaImport({
        bpmnXml: defaultBpmn,
        xmiXml: defaultXmi
      })

    expect(result.bpmnXml).not.toContain('bioc:fill')
    expect(result.bpmnXml).not.toContain('bioc:stroke')

    expect(
      result.repairs.filter(
        repair =>
          repair.type === 'restore-ea-diagram-color'
      )
    ).toEqual([])
  })
})
