import { describe, it, expect } from 'vitest'
import { EMPTY_DIAGRAM } from './starter-bpmn.js'

describe('starter BPMN', () => {
  it('contains a BPMN definitions root', () => {
    expect(EMPTY_DIAGRAM).toContain('<bpmn:definitions')
  })

  it('contains the repository context', () => {
    expect(EMPTY_DIAGRAM).toContain('semarch:RepositoryContext')
  })

  it('contains the starter collaboration', () => {
    expect(EMPTY_DIAGRAM).toContain('bpmn:collaboration')
  })
})