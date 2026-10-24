import { describe, expect, it } from 'vitest'
import { createEmptyBpmnModel, readBpmnIdentity, findBpmnIdentityConflict, validateBpmnIdentifier } from './workspace-bpmn-model.js'

for (const kind of ['process', 'collaboration']) {
  describe('Empty BPMN ' + kind, () => {
    it('creates valid namespaced definitions and an empty plane with the requested identity', () => {
      const xml = createEmptyBpmnModel({ kind, id: 'My_1' })
      const ids = readBpmnIdentity(xml)
      expect(ids.has('My_1')).toBe(true)
      expect(ids.has('Definitions_My_1')).toBe(true)
      expect(xml).toContain('bpmnElement="My_1"')
      expect(xml).not.toContain('BPMNShape')
      expect(xml).not.toContain('BPMNEdge')
    })
    it('refuses a second model with the same BPMN identity without changing the documents', () => {
      const xml = createEmptyBpmnModel({ kind, id: 'My_1' })
      const docs = [{ id: 'doc-1', kind: 'bpmn', content: xml }]
      expect(findBpmnIdentityConflict(xml, docs)).toEqual({ id: 'Definitions_My_1', documentId: 'doc-1' })
      expect(docs).toHaveLength(1)
    })
  })
}

describe('Identity rejection', () => {
  it('rejects unsafe and empty identifiers', () => {
    for (const id of ['', '12bad', 'a b', '<bad>', 'a:b']) {
      expect(() => validateBpmnIdentifier(id)).toThrow()
    }
  })
  it('allows unrelated process identities', () => {
    const a = createEmptyBpmnModel({ kind: 'process', id: 'A' })
    const b = createEmptyBpmnModel({ kind: 'process', id: 'B' })
    expect(findBpmnIdentityConflict(b, [{ id: 'a', kind: 'bpmn', content: a }])).toBe(null)
  })
  it('rejects an invalid input before import', () => {
    expect(() => findBpmnIdentityConflict('<bad/>', [])).toThrow()
  })
})
