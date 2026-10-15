import { describe, it, expect } from 'vitest'
import { assessWorkspaceTransition } from './workspace-transition-guard.js'

const ns = 'http://www.omg.org/spec/BPMN/20100524/MODEL'
const doc = inner => `<bpmn:definitions xmlns:bpmn="${ns}">${inner}</bpmn:definitions>`
const source = doc('<bpmn:process id="p"/>')
const formatted = `<bpmn:definitions xmlns:bpmn="${ns}">\n  <bpmn:process id="p" />\n</bpmn:definitions>`
function setup(content, canvas = formatted, { dirty = false, canUndo = false } = {}) {
  const active = { id: 'doc', kind: 'bpmn', dirty, content }
  return {
    repository: { documents: { getDocuments: () => [active], getActiveDocument: () => active } },
    modeler: { get: () => ({ canUndo: () => canUndo }), saveXML: async () => ({xml: canvas}) }
  }
}
describe('WS-01 guarded transition after archive reopen', () => {
  it('accepts a clean equivalent restored canvas', async () => {
    expect(await assessWorkspaceTransition(setup(source))).toEqual({safe:true,reason:'DOCUMENT_AND_CANVAS_MATCH'})
  })
  it('blocks modified BPMN despite clean flags', async () => {
    expect((await assessWorkspaceTransition(setup(source,doc('<bpmn:process id="changed"/>')))).reason).toBe('CANVAS_DOCUMENT_MISMATCH')
  })
  it('blocks dirty documents and command history', async () => {
    expect((await assessWorkspaceTransition(setup(source,formatted,{dirty:true}))).safe).toBe(false)
    expect((await assessWorkspaceTransition(setup(source,formatted,{canUndo:true}))).reason).toBe('CANVAS_COMMAND_HISTORY')
  })
  it('blocks invalid XML and unknown state', async () => {
    expect((await assessWorkspaceTransition(setup(source,'<broken'))).reason).toBe('CANVAS_DOCUMENT_MISMATCH')
  })
})
