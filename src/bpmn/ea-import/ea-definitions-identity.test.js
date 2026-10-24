import { describe, it, expect } from 'vitest'
import { canonicalizeEaDefinitionsIdentity } from './ea-definitions-identity.js'
import { findBpmnIdentityConflict } from '../workspace-bpmn-model.js'

const makeXml = ({ kind = 'process', id, root = 'Definitions_EA_XSLT_07' }) =>
  `<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="${root}"><bpmn:${kind} id="${id}"/></bpmn:definitions>`

describe('Sparx EA distinct BPMN model identities', () => {
  it('allows different processes with the same converter definitions constant', () => {
    const first = canonicalizeEaDefinitionsIdentity(makeXml({ id: 'EA_PROCESS_1' }))
    const second = canonicalizeEaDefinitionsIdentity(makeXml({ id: 'EA_PROCESS_2' }))
    expect(findBpmnIdentityConflict(second, [{ id: 'imported-1', kind: 'bpmn', content: first }])).toBeNull()
  })
  it('allows distinct collaborations and retains business identities', () => {
    const first = canonicalizeEaDefinitionsIdentity(makeXml({ kind: 'collaboration', id: 'EA_COLLAB_1' }))
    const second = canonicalizeEaDefinitionsIdentity(makeXml({ kind: 'collaboration', id: 'EA_COLLAB_2' }))
    expect(first).toContain('EA_COLLAB_1')
    expect(findBpmnIdentityConflict(second, [{ id: 'imported-1', kind: 'bpmn', content: first }])).toBeNull()
  })
  it('still refuses a second import with the same process identity', () => {
    const first = canonicalizeEaDefinitionsIdentity(makeXml({ id: 'EA_PROCESS_1' }))
    const second = canonicalizeEaDefinitionsIdentity(makeXml({ id: 'EA_PROCESS_1' }))
    expect(findBpmnIdentityConflict(second, [{ id: 'imported-1', kind: 'bpmn', content: first }])).toEqual({ id: 'Definitions_EA_EA_PROCESS_1', documentId: 'imported-1' })
  })
  it('is stable when applied twice', () => {
    const first = canonicalizeEaDefinitionsIdentity(makeXml({ id: 'EA_PROCESS_1' }))
    expect(canonicalizeEaDefinitionsIdentity(first)).toBe(first)
  })
  it('rejects a document without a process or collaboration', () => {
    expect(() => canonicalizeEaDefinitionsIdentity('<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="x"/>')).toThrow()
  })
})
