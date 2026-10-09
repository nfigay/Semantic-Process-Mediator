import { describe, it, expect } from 'vitest'
import { BpmnModdle } from 'bpmn-moddle'
// Vitest/Vite may expose the CommonJS constructor under a nested default export.

import { collectScalarProperties, scalarValueToModdle } from './bpmn-standard-scalar.js'
import { inheritedPropertyLabel } from './bpmn-property-inheritance.js'

const BASE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Definitions_1" targetNamespace="http://example.org/bpmns">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:task id="Task_1" name="Original" />
    <bpmn:exclusiveGateway id="Gateway_1" />
  </bpmn:process>
</bpmn:definitions>`

async function roundtrip(change) {
  const moddle = new BpmnModdle()
  const { rootElement } = await moddle.fromXML(BASE_XML)
  const process = rootElement.rootElements[0]
  const task = process.flowElements.find(e => e.$type === 'bpmn:Task')
  const gateway = process.flowElements.find(e => e.$type === 'bpmn:ExclusiveGateway')
  change({ moddle, process, task, gateway })
  const { xml } = await moddle.toXML(rootElement, { format: true })
  const { rootElement: restored } = await moddle.fromXML(xml)
  const restoredProcess = restored.rootElements[0]
  return { xml, process: restoredProcess, task: restoredProcess.flowElements.find(e => e.$type === 'bpmn:Task'), gateway: restoredProcess.flowElements.find(e => e.$type === 'bpmn:ExclusiveGateway') }
}

describe('PROP-005: BPMN standard scalar XML roundtrip', () => {
  it('preserves inherited Boolean attributes on Task and Process', async () => {
    const result = await roundtrip(({ task, process }) => {
      task.isForCompensation = scalarValueToModdle('Boolean', true)
      process.isExecutable = scalarValueToModdle('Boolean', true)
    })
    expect(result.task.isForCompensation).toBe(true)
    expect(result.process.isExecutable).toBe(true)
    expect(result.xml).toContain('isForCompensation="true"')
    expect(result.xml).toContain('isExecutable="true"')
  })
  it('preserves gateway enum attributes', async () => {
    const result = await roundtrip(({ gateway }) => {
      gateway.gatewayDirection = 'Diverging'
    })
    expect(result.gateway.gatewayDirection).toBe('Diverging')
    expect(result.xml).toContain('gatewayDirection="Diverging"')
  })
  it('preserves string attributes and XML escaping', async () => {
    const result = await roundtrip(({ task }) => { task.name = 'A & B < C' })
    expect(result.task.name).toBe('A & B < C')
    expect(result.xml).toMatch(/A (?:&amp;|&#38;) B (?:&lt;|&#60;) C/)
  })
  it('rejects invalid numeric values before they reach modeling', () => {
    expect(scalarValueToModdle('Integer', '3.2')).toBeNull()
    expect(scalarValueToModdle('Real', 'NaN')).toBeNull()
    expect(scalarValueToModdle('Integer', '42')).toBe(42)
    expect(scalarValueToModdle('Real', '0.25')).toBe(0.25)
  })
  it('detects inherited attributes in effective Task descriptor', () => {
    const moddle = new BpmnModdle()
    const properties = collectScalarProperties(moddle, 'bpmn:Task')
    expect(properties.some(x => x.property.name === 'isForCompensation' && x.kind === 'Boolean')).toBe(true)
    expect(inheritedPropertyLabel(moddle, 'bpmn:Task', 'isForCompensation')).toContain('inherited')
  })
})
