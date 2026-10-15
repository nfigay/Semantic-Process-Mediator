import { describe, it, expect } from 'vitest'
import { equivalentWorkspaceBpmnXml as eq } from './workspace-xml-equivalence.js'

const ns = 'http://www.omg.org/spec/BPMN/20100524/MODEL'
const di = 'http://www.omg.org/spec/BPMN/20100524/DI'
const doc = (inner, attrs = '') => `<bpmn:definitions xmlns:bpmn="${ns}" xmlns:bpmndi="${di}" ${attrs}>${inner}</bpmn:definitions>`

describe('WS-01 workspace XML equivalence (fail closed)', () => {
  it('accepts formatting, namespace prefix and attribute order changes', () => {
    const a = doc('<bpmn:process id="p" name="P"/><bpmndi:BPMNDiagram id="d"/>')
    const b = `<x:definitions xmlns:x="${ns}" xmlns:di="${di}">\n  <x:process name="P" id="p" />\n  <di:BPMNDiagram id="d"/>\n</x:definitions>`
    expect(eq(a,b)).toBe(true)
  })
  it('rejects process attribute modifications', () => {
    expect(eq(doc('<bpmn:process id="p"/>'),doc('<bpmn:process id="q"/>'))).toBe(false)
  })
  it('rejects BPMN-DI differences', () => {
    expect(eq(doc('<bpmndi:BPMNPlane id="d"/>'), doc('<bpmndi:BPMNPlane id="x"/>'))).toBe(false)
  })
  it('rejects reordered elements', () => {
    expect(eq(doc('<bpmn:process id="p"/><bpmn:process id="q"/>'),doc('<bpmn:process id="q"/><bpmn:process id="p"/>'))).toBe(false)
  })
  it('rejects altered meaningful text and malformed/unsupported XML', () => {
    expect(eq(doc('<bpmn:documentation>Important</bpmn:documentation>'),doc('<bpmn:documentation>Changed</bpmn:documentation>'))).toBe(false)
    expect(eq(doc('<bpmn:process/>'),'<broken')).toBe(false)
    expect(eq(doc('<bpmn:process/>'), '<!DOCTYPE x><bpmn:definitions/>')).toBe(false)
  })
})
