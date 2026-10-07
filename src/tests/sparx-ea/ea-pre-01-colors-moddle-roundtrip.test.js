import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { BpmnModdle } from 'bpmn-moddle'
import { describe, expect, it } from 'vitest'
import { normalizeSparxEaImport } from '../../platforms/sparx-ea/preprocessing/normalize-import.js'

const fixture = name => readFileSync(
  fileURLToPath(
    new URL(
      './EA-PRE-01/cases/colors-001/input/' + name,
      import.meta.url
    )
  ),
  'utf8'
)

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

function findDi(definitions, bpmnElementId) {
  for (const diagram of definitions.diagrams || []) {
    for (const planeElement of diagram.plane?.planeElement || []) {
      if (planeElement.bpmnElement?.id === bpmnElementId) {
        return planeElement
      }
    }
  }

  return null
}

describe('EA-PRE-01 explicit colors moddle round-trip', () => {
  it('preserves recovered EA colors through BPMN moddle serialization', async () => {
    const normalized =
      normalizeSparxEaImport({
        bpmnXml:
          fixture('EA-PRE-01-COLORS non default-BPMN20.xml'),
        xmiXml:
          fixture('EA-PRE-01-COLORS non default-XMI251.xml')
      })

    const moddle = new BpmnModdle()

    const imported =
      await moddle.fromXML(normalized.bpmnXml)

    const serialized =
      await moddle.toXML(imported.rootElement)

    expect(serialized.xml).toContain('bioc:fill')
    expect(serialized.xml).toContain('bioc:stroke')

    const reopened =
      await moddle.fromXML(serialized.xml)

    const definitions = reopened.rootElement

    const start = findDi(definitions, START)
    const end = findDi(definitions, END)
    const task = findDi(definitions, TASK)
    const data = findDi(definitions, DATA)

    const taskToEnd = findDi(definitions, TASK_TO_END)
    const taskToData = findDi(definitions, TASK_TO_DATA)
    const startToTask = findDi(definitions, START_TO_TASK)

    expect(start).toBeTruthy()
    expect(end).toBeTruthy()
    expect(task).toBeTruthy()
    expect(data).toBeTruthy()

    expect(taskToEnd).toBeTruthy()
    expect(taskToData).toBeTruthy()
    expect(startToTask).toBeTruthy()

    expect(start.get('bioc:fill')).toBe('#FFA500')
    expect(start.get('bioc:stroke')).toBe('#191970')

    expect(task.get('bioc:fill')).toBe('#00FF00')
    expect(task.get('bioc:stroke')).toBe('#0000CD')

    expect(end.get('bioc:fill')).toBe('#1E90FF')
    expect(end.get('bioc:stroke')).toBeUndefined()

    expect(data.get('bioc:fill')).toBe('#A9A9A9')
    expect(data.get('bioc:stroke')).toBe('#00BFFF')

    expect(taskToEnd.get('bioc:stroke')).toBe('#0000FF')
    expect(taskToData.get('bioc:stroke')).toBe('#CD853F')
    expect(startToTask.get('bioc:stroke')).toBe('#FF1493')
  })

  it('keeps the default EA fixture free of explicit bioc colors', async () => {
    const normalized =
      normalizeSparxEaImport({
        bpmnXml:
          fixture('EA-PRE-01-COLORS-BPMN20.xml'),
        xmiXml:
          fixture('EA-PRE-01-COLORS-XMI251.xml')
      })

    const moddle = new BpmnModdle()

    const imported =
      await moddle.fromXML(normalized.bpmnXml)

    const serialized =
      await moddle.toXML(imported.rootElement)

    expect(serialized.xml).not.toContain('bioc:fill')
    expect(serialized.xml).not.toContain('bioc:stroke')
  })
})
